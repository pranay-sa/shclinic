import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  Activity,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  FileImage,
  FileText,
  Filter,
  HeartPulse,
  Phone,
  Pill,
  Ruler,
  Scale,
  Search,
  Stethoscope,
  Trash2,
  Upload,
  UserRound,
  X,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/core/http";
import { authStore } from "@/core/auth";

type MedTab = "prescriptions" | "bills" | "image" | "text";

type UploadCategory = "prescription" | "image" | "text";

type ModalState =
  | { type: "none" }
  | { type: "upload" }
  | { type: "viewer"; fileName: string; previewUrl?: string }
  | {
      type: "delete";
      deleteSource: "rx" | "bill" | "img" | "txt" | "simpleRx";
      id: string;
      fileName: string;
      labelType: "PRESCRIPTION" | "BILL" | "IMAGE REPORT" | "TEXT REPORT";
    }
  | { type: "vitals"; billId: string }
  | { type: "apt" };

type RxRow = {
  kind: "rx";
  id: string;
  doctor: string;
  date: string;
  rxId: string;
  source: "S&H" | "Other";
  file: string;
  previewUrl?: string;
};

type BillRow = {
  kind: "bill";
  id: string;
  title: string;
  date: string;
  billNo: string;
  showGenRx?: boolean;
  file: string;
  previewUrl?: string;
};

type ImgRow = {
  kind: "image";
  id: string;
  title: string;
  date: string;
  reportId: string;
  source: "S&H" | "Other";
  file: string;
  previewUrl?: string;
};

type TxtRow = {
  kind: "text";
  id: string;
  title: string;
  date: string;
  reportId: string;
  source: "S&H" | "Other";
  file: string;
  previewUrl?: string;
};

const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
const UPLOAD_ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

type ApiPatientPick = { id: string; first_name: string; last_name: string; patient_code: string };

const initialRx: RxRow[] = [
  {
    kind: "rx",
    id: "rx1",
    doctor: "Dr. Johann Varghese",
    date: "Oct 24, 2026",
    rxId: "Prescription ID — RX-24102026001",
    source: "S&H",
    file: "prescription_name.pdf"
  },
  {
    kind: "rx",
    id: "rx2",
    doctor: "Dr. Arjun Sharma",
    date: "Oct 12, 2026",
    rxId: "Prescription ID — RX-24101226002",
    source: "Other",
    file: "Medication_List_Oct_2023.pdf"
  }
];

const initialBills: BillRow[] = [
  {
    kind: "bill",
    id: "b1",
    title: "Consultation",
    date: "Oct 24, 2026",
    billNo: "Bill no — 2410202600010020",
    showGenRx: true,
    file: "bill_one.pdf"
  },
  {
    kind: "bill",
    id: "b2",
    title: "Consultation & Lab test",
    date: "Oct 24, 2024",
    billNo: "Bill no — 2410202400010020",
    file: "bill_lab.pdf"
  },
  {
    kind: "bill",
    id: "b3",
    title: "Lab test",
    date: "Oct 23, 2023",
    billNo: "Bill no — 2310202300010020",
    file: "bill_lab_only.pdf"
  }
];

const initialImg: ImgRow[] = [
  { kind: "image", id: "i1", title: "MRI", date: "Oct 24, 2026", reportId: "Report ID — IMG-24102026001", source: "S&H", file: "image_one.png" },
  { kind: "image", id: "i2", title: "2D Echo", date: "Oct 18, 2026", reportId: "Report ID — IMG-24101826002", source: "S&H", file: "echo_report.pdf" },
  { kind: "image", id: "i3", title: "ECG", date: "Oct 10, 2026", reportId: "Report ID — IMG-24101026003", source: "Other", file: "image_one.pdf" }
];

const initialTxt: TxtRow[] = [
  { kind: "text", id: "t1", title: "Lipid Profile", date: "Oct 24, 2026", reportId: "Report ID — 2410202600010020", source: "S&H", file: "lipid_test.pdf" },
  { kind: "text", id: "t2", title: "HbA1c", date: "Oct 24, 2024", reportId: "Report ID — 2410202400010020", source: "S&H", file: "hba1c.pdf" },
  { kind: "text", id: "t3", title: "Lipid Profile", date: "Oct 24, 2023", reportId: "Report ID — 2410202300010020", source: "Other", file: "lipid_external.pdf" }
];

/** Two-tab “Prescriptions” list matching clinic mock (report-style rows, text report delete copy). */
const initialSimpleRx: TxtRow[] = [
  { kind: "text", id: "sr1", title: "Lipid Profile", date: "Oct 24, 2026", reportId: "Report ID — 2410202600010020", source: "S&H", file: "text_one.pdf" },
  { kind: "text", id: "sr2", title: "HbA1c", date: "Oct 24, 2026", reportId: "Report ID — 2410202600010021", source: "Other", file: "hba1c.pdf" }
];

function genAutoId(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}${mm}${yyyy}DASSHC042`;
}

type LayoutMode = "simple" | "full";

export function MedicalRecordsPage() {
  const [patientQuery, setPatientQuery] = useState("");
  const [reportQuery, setReportQuery] = useState("");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("simple");
  const [tab, setTab] = useState<MedTab>("prescriptions");
  const [rxRows, setRxRows] = useState(initialRx);
  const [simpleRxRows, setSimpleRxRows] = useState(initialSimpleRx);
  const [billRows, setBillRows] = useState(initialBills);
  const [imgRows, setImgRows] = useState(initialImg);
  const [txtRows, setTxtRows] = useState(initialTxt);
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const [uploadCat, setUploadCat] = useState<UploadCategory>("prescription");
  const [uploadDoctor, setUploadDoctor] = useState("Dr. Arjun Sharma");
  const [uploadReportName, setUploadReportName] = useState("MRI");
  const [uploadDate, setUploadDate] = useState("2026-04-27");
  const [uploadClinicSh, setUploadClinicSh] = useState(true);
  const [autoId] = useState(() => genAutoId());
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backendPatient, setBackendPatient] = useState<ApiPatientPick | null>(null);

  const [viewerPage, setViewerPage] = useState(1);
  const viewerTotal = 24;

  useEffect(() => {
    apiRequest<{ items: ApiPatientPick[] }>("/patients?search=&page=1&pageSize=1")
      .then((resp) => setBackendPatient(resp.items[0] ?? null))
      .catch(() => setBackendPatient(null));
  }, []);

  useEffect(() => {
    if (modal.type === "viewer") setViewerPage(1);
  }, [modal]);

  useEffect(() => {
    if (layoutMode === "simple" && (tab === "image" || tab === "text")) {
      setTab("prescriptions");
    }
  }, [layoutMode, tab]);

  const clearUploadSelection = useCallback(() => {
    setUploadPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setUploadFile(null);
    setUploadError(null);
    setIsDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  useEffect(() => {
    if (modal.type !== "upload") clearUploadSelection();
  }, [modal.type, clearUploadSelection]);

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  const handleUploadFile = useCallback(
    (file: File) => {
      setUploadError(null);
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const validExt = ["pdf", "jpg", "jpeg", "png"];
      const validType =
        file.type === "application/pdf" || file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg";
      if (!validExt.includes(ext) && !validType) {
        setUploadError("Please upload PDF, JPG or PNG (max. 10MB).");
        return;
      }
      if (file.size > UPLOAD_MAX_BYTES) {
        setUploadError("File exceeds 10MB limit.");
        return;
      }
      setUploadPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      });
      setUploadFile(file);
    },
    [],
  );

  const [vitals, setVitals] = useState({
    height: "175",
    weight: "75",
    pulse: "72",
    spo2: "98",
    complaints: ""
  });

  const [aptVitals, setAptVitals] = useState({ height: "175", weight: "75", pulse: "72", spo2: "98" });

  const patientVisible = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    if (!q) return true;
    return "jonathan d. miller".includes(q) || "0001882910".includes(q);
  }, [patientQuery]);

  const filteredRx = useMemo(() => {
    const q = reportQuery.trim().toLowerCase();
    if (!q) return rxRows;
    return rxRows.filter((r) => r.doctor.toLowerCase().includes(q) || r.rxId.toLowerCase().includes(q));
  }, [rxRows, reportQuery]);

  const filteredBills = useMemo(() => {
    const q = reportQuery.trim().toLowerCase();
    if (!q) return billRows;
    return billRows.filter((r) => r.title.toLowerCase().includes(q) || r.billNo.toLowerCase().includes(q));
  }, [billRows, reportQuery]);

  const filteredImg = useMemo(() => {
    const q = reportQuery.trim().toLowerCase();
    if (!q) return imgRows;
    return imgRows.filter((r) => r.title.toLowerCase().includes(q));
  }, [imgRows, reportQuery]);

  const filteredTxt = useMemo(() => {
    const q = reportQuery.trim().toLowerCase();
    if (!q) return txtRows;
    return txtRows.filter((r) => r.title.toLowerCase().includes(q));
  }, [txtRows, reportQuery]);

  const filteredSimpleRx = useMemo(() => {
    const q = reportQuery.trim().toLowerCase();
    if (!q) return simpleRxRows;
    return simpleRxRows.filter((r) => r.title.toLowerCase().includes(q) || r.reportId.toLowerCase().includes(q));
  }, [simpleRxRows, reportQuery]);

  const bmi = useMemo(() => {
    const h = Number(vitals.height) / 100;
    const w = Number(vitals.weight);
    if (!h || !w) return "—";
    const v = w / (h * h);
    if (!Number.isFinite(v)) return "—";
    const cat = v < 18.5 ? "Underweight" : v < 25 ? "Normal" : v < 30 ? "Overweight" : "High";
    return `${v.toFixed(1)} ${cat}`;
  }, [vitals.height, vitals.weight]);

  const copyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(autoId);
    } catch {
      /* ignore */
    }
  }, [autoId]);

  function deleteBody(label: "PRESCRIPTION" | "BILL" | "IMAGE REPORT" | "TEXT REPORT"): string {
    if (label === "PRESCRIPTION") {
      return "Are you sure you want to delete this prescription? This action cannot be undone and the document will be permanently removed from your records.";
    }
    if (label === "BILL") {
      return "Are you sure you want to delete this bill? This action cannot be undone and the document will be permanently removed from your records.";
    }
    if (label === "IMAGE REPORT") {
      return "Are you sure you want to delete this image report? This action cannot be undone and the document will be permanently removed from your records.";
    }
    return "Are you sure you want to delete this text report? This action cannot be undone and the document will be permanently removed from your records.";
  }

  function confirmDelete(m: Extract<ModalState, { type: "delete" }>) {
    const id = m.id;
    if (m.deleteSource === "rx") setRxRows((rows) => rows.filter((r) => r.id !== id));
    if (m.deleteSource === "simpleRx") setSimpleRxRows((rows) => rows.filter((r) => r.id !== id));
    if (m.deleteSource === "bill") setBillRows((rows) => rows.filter((r) => r.id !== id));
    if (m.deleteSource === "img") setImgRows((rows) => rows.filter((r) => r.id !== id));
    if (m.deleteSource === "txt") setTxtRows((rows) => rows.filter((r) => r.id !== id));
    setModal({ type: "none" });
  }

  function saveUpload() {
    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
      return;
    }
    if (!backendPatient) {
      setUploadError("No patient found in backend. Please create a patient first.");
      return;
    }
    const src = uploadClinicSh ? "S&H" : "Other";
    const id = `new-${Date.now()}`;
    const formattedDate = new Date(uploadDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Persist file + record in backend for the cloud demo
    void (async () => {
      try {
        const fd = new FormData();
        fd.append("file", uploadFile);
        const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
        const token = authStore.getToken();
        const user = authStore.getUser();
        const clinicId = user?.clinicIds?.[0] ?? null;
        const uploadResp = await fetch(`${baseUrl}/uploads/medical-records`, {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(clinicId ? { "X-Clinic-Id": clinicId } : {}),
          },
          body: fd,
        });
        if (!uploadResp.ok) throw new Error("Upload failed");
        const uploaded = (await uploadResp.json()) as { fileName: string; url: string };

        const recordType =
          uploadCat === "prescription" ? "prescription" : uploadCat === "image" ? "image_report" : "text_report";
        const title = uploadCat === "prescription" ? uploadDoctor : uploadReportName;
        await apiRequest("/medical-records", {
          method: "POST",
          body: {
            patientId: backendPatient.id,
            recordType,
            title,
            source: src,
            fileName: uploaded.fileName,
          },
        });
      } catch {
        // If backend fails, keep local demo behavior
      }
    })();

    const file = uploadFile.name;
    const previewUrl = uploadPreviewUrl ?? undefined;
    if (uploadCat === "prescription") {
      setRxRows((r) => [
        {
          kind: "rx",
          id,
          doctor: uploadDoctor,
          date: formattedDate,
          rxId: `Prescription ID — ${autoId.slice(0, 14)}`,
          source: src,
          file,
          previewUrl,
        },
        ...r,
      ]);
      setTab("prescriptions");
    } else if (uploadCat === "image") {
      setImgRows((r) => [
        {
          kind: "image",
          id,
          title: uploadReportName,
          date: formattedDate,
          reportId: `Report ID — ${autoId.slice(0, 14)}`,
          source: src,
          file,
          previewUrl,
        },
        ...r,
      ]);
      setTab("image");
    } else {
      setTxtRows((r) => [
        {
          kind: "text",
          id,
          title: uploadReportName,
          date: formattedDate,
          reportId: `Report ID — ${autoId.slice(0, 14)}`,
          source: src,
          file,
          previewUrl,
        },
        ...r,
      ]);
      setTab("text");
    }
    setUploadFile(null);
    setUploadPreviewUrl(null);
    setUploadError(null);
    setIsDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModal({ type: "none" });
  }

  function stop(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div className="screen-wrap calendar-screen doc-pat-screen medrec-page">
      <div className="medrec-head">
        <span className="medrec-head-k">
          <UserRound size={16} strokeWidth={2} aria-hidden />
          Patient
        </span>
        <div className="medrec-search-patient">
          <Search size={18} strokeWidth={2} className="medrec-search-ico" aria-hidden />
          <input placeholder="Search Patient" value={patientQuery} onChange={(e) => setPatientQuery(e.target.value)} />
        </div>
      </div>

      {patientVisible ? (
        <>
          <section className="medrec-patient-card">
            <div className="medrec-patient-left">
              <span className="medrec-patient-av" aria-hidden>
                JM
              </span>
              <div>
                <h2 className="medrec-patient-name">Jonathan D. Miller</h2>
                <p className="medrec-patient-meta">42 years old • Male • Patient ID: 0001882910</p>
              </div>
            </div>
            <div className="medrec-patient-actions">
              <button type="button" className="medrec-link-apt" onClick={() => setModal({ type: "apt" })}>
                Incoming appointment
              </button>
              <button type="button" className="medrec-btn-new" onClick={() => setModal({ type: "upload" })}>
                + New Record
              </button>
            </div>
          </section>

          <div className="medrec-toolbar">
            <div className="medrec-toolbar-left">
              <div className="medrec-layout-toggle" role="group" aria-label="Which record categories to show">
                <button
                  type="button"
                  className={layoutMode === "simple" ? "is-on" : ""}
                  onClick={() => {
                    setLayoutMode("simple");
                    setReportQuery("");
                  }}
                >
                  Prescriptions &amp; Bills
                </button>
                <button
                  type="button"
                  className={layoutMode === "full" ? "is-on" : ""}
                  onClick={() => {
                    setLayoutMode("full");
                    setReportQuery("");
                  }}
                >
                  All types
                </button>
              </div>
              <div
                className={`medrec-tabs ${layoutMode === "simple" ? "medrec-tabs-simple" : "medrec-tabs-full"}`}
                role="tablist"
              >
                {(
                  layoutMode === "simple"
                    ? ([
                        { id: "prescriptions" as const, label: "Prescriptions" },
                        { id: "bills" as const, label: "Bills" }
                      ] as const)
                    : ([
                        { id: "prescriptions" as const, label: "Prescriptions" },
                        { id: "bills" as const, label: "Bills" },
                        { id: "image" as const, label: "Image Reports" },
                        { id: "text" as const, label: "Text Reports" }
                      ] as const)
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    className={`medrec-tab ${tab === t.id ? "is-active" : ""}`}
                    onClick={() => {
                      setTab(t.id);
                      setReportQuery("");
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="medrec-toolbar-right">
              <div className="medrec-search-reports">
                <Search size={16} strokeWidth={2} aria-hidden />
                <input placeholder="Search reports..." value={reportQuery} onChange={(e) => setReportQuery(e.target.value)} />
              </div>
              <button type="button" className="medrec-filter-btn" aria-label="Filter">
                <Filter size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="medrec-list">
            {tab === "prescriptions" &&
              (layoutMode === "simple"
                ? filteredSimpleRx.map((row) => (
                    <article key={row.id} className="medrec-row medrec-row-rx">
                      <div className="medrec-row-main">
                        <strong>{row.title}</strong>
                        <span className="medrec-row-date">
                          <CalendarDays size={13} strokeWidth={2} /> {row.date}
                        </span>
                        <span className="medrec-row-id">{row.reportId}</span>
                      </div>
                      <div className="medrec-row-actions">
                        <span className={`medrec-tag ${row.source === "S&H" ? "is-sh" : "is-other"}`}>
                          {row.source === "S&H" ? "S&H" : "Other Clinic"}
                        </span>
                        <button
                          type="button"
                          className="medrec-ico danger"
                          aria-label="Delete"
                          onClick={() =>
                            setModal({
                              type: "delete",
                              deleteSource: "simpleRx",
                              id: row.id,
                              fileName: row.file,
                              labelType: "TEXT REPORT"
                            })
                          }
                        >
                          <Trash2 size={17} strokeWidth={2} />
                        </button>
                        <button type="button" className="medrec-ico" aria-label="View" onClick={() => setModal({ type: "viewer", fileName: row.file, previewUrl: row.previewUrl })}>
                          <Eye size={17} strokeWidth={2} />
                        </button>
                        <button type="button" className="medrec-ico" aria-label="Download">
                          <Download size={17} strokeWidth={2} />
                        </button>
                      </div>
                    </article>
                  ))
                : filteredRx.map((row) => (
                    <article key={row.id} className="medrec-row medrec-row-rx">
                      <div className="medrec-row-main">
                        <strong>{row.doctor}</strong>
                        <span className="medrec-row-date">
                          <CalendarDays size={13} strokeWidth={2} /> {row.date}
                        </span>
                        <span className="medrec-row-id">{row.rxId}</span>
                      </div>
                      <div className="medrec-row-actions">
                        <span className={`medrec-tag ${row.source === "S&H" ? "is-sh" : "is-other"}`}>{row.source === "S&H" ? "S&H" : "Other Clinic"}</span>
                        <button
                          type="button"
                          className="medrec-ico danger"
                          aria-label="Delete"
                          onClick={() =>
                            setModal({
                              type: "delete",
                              deleteSource: "rx",
                              id: row.id,
                              fileName: row.file,
                              labelType: "PRESCRIPTION"
                            })
                          }
                        >
                          <Trash2 size={17} strokeWidth={2} />
                        </button>
                        <button type="button" className="medrec-ico" aria-label="View" onClick={() => setModal({ type: "viewer", fileName: row.file, previewUrl: row.previewUrl })}>
                          <Eye size={17} strokeWidth={2} />
                        </button>
                        <button type="button" className="medrec-ico" aria-label="Download">
                          <Download size={17} strokeWidth={2} />
                        </button>
                      </div>
                    </article>
                  )))}

            {tab === "bills" &&
              filteredBills.map((row) => (
                <article key={row.id} className="medrec-row medrec-row-bill">
                  <span className="medrec-bill-accent" aria-hidden />
                  <div className="medrec-row-main">
                    <strong>{row.title}</strong>
                    <span className="medrec-row-date">
                      <CalendarDays size={13} strokeWidth={2} /> {row.date}
                    </span>
                    <span className="medrec-row-id">{row.billNo}</span>
                  </div>
                  <div className="medrec-row-actions medrec-row-actions-wide">
                    {row.showGenRx && (
                      <button type="button" className="medrec-gen-rx" onClick={() => setModal({ type: "vitals", billId: row.id })}>
                        <FileText size={15} strokeWidth={2} />
                        Generate Prescription
                      </button>
                    )}
                    <button
                      type="button"
                      className="medrec-ico danger"
                      aria-label="Delete"
                      onClick={() =>
                        setModal({ type: "delete", deleteSource: "bill", id: row.id, fileName: row.file, labelType: "BILL" })
                      }
                    >
                      <Trash2 size={17} strokeWidth={2} />
                    </button>
                    <button type="button" className="medrec-ico" aria-label="View" onClick={() => setModal({ type: "viewer", fileName: row.file, previewUrl: row.previewUrl })}>
                      <Eye size={17} strokeWidth={2} />
                    </button>
                    <button type="button" className="medrec-ico" aria-label="Download">
                      <Download size={17} strokeWidth={2} />
                    </button>
                  </div>
                </article>
              ))}

            {tab === "image" &&
              filteredImg.map((row) => (
                <article key={row.id} className="medrec-row medrec-row-bill">
                  <span className="medrec-bill-accent" aria-hidden />
                  <div className="medrec-row-main">
                    <strong>{row.title}</strong>
                    <span className="medrec-row-date">
                      <CalendarDays size={13} strokeWidth={2} /> {row.date}
                    </span>
                    <span className="medrec-row-id">{row.reportId}</span>
                  </div>
                  <div className="medrec-row-actions">
                    <span className={`medrec-tag ${row.source === "S&H" ? "is-sh" : "is-other"}`}>{row.source === "S&H" ? "S&H" : "Other Clinic"}</span>
                    <button
                      type="button"
                      className="medrec-ico danger"
                      aria-label="Delete"
                      onClick={() =>
                        setModal({ type: "delete", deleteSource: "img", id: row.id, fileName: row.file, labelType: "IMAGE REPORT" })
                      }
                    >
                      <Trash2 size={17} strokeWidth={2} />
                    </button>
                    <button type="button" className="medrec-ico" aria-label="View" onClick={() => setModal({ type: "viewer", fileName: row.file, previewUrl: row.previewUrl })}>
                      <Eye size={17} strokeWidth={2} />
                    </button>
                    <button type="button" className="medrec-ico" aria-label="Download">
                      <Download size={17} strokeWidth={2} />
                    </button>
                  </div>
                </article>
              ))}

            {tab === "text" &&
              filteredTxt.map((row) => (
                <article key={row.id} className="medrec-row medrec-row-bill">
                  <span className="medrec-bill-accent" aria-hidden />
                  <div className="medrec-row-main">
                    <strong>{row.title}</strong>
                    <span className="medrec-row-date">
                      <CalendarDays size={13} strokeWidth={2} /> {row.date}
                    </span>
                    <span className="medrec-row-id">{row.reportId}</span>
                  </div>
                  <div className="medrec-row-actions">
                    <span className={`medrec-tag ${row.source === "S&H" ? "is-sh" : "is-other"}`}>{row.source === "S&H" ? "S&H" : "Other Clinic"}</span>
                    <button
                      type="button"
                      className="medrec-ico danger"
                      aria-label="Delete"
                      onClick={() =>
                        setModal({ type: "delete", deleteSource: "txt", id: row.id, fileName: row.file, labelType: "TEXT REPORT" })
                      }
                    >
                      <Trash2 size={17} strokeWidth={2} />
                    </button>
                    <button type="button" className="medrec-ico" aria-label="View" onClick={() => setModal({ type: "viewer", fileName: row.file, previewUrl: row.previewUrl })}>
                      <Eye size={17} strokeWidth={2} />
                    </button>
                    <button type="button" className="medrec-ico" aria-label="Download">
                      <Download size={17} strokeWidth={2} />
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </>
      ) : (
        <p className="medrec-empty">No patient matches your search. Try “Jonathan” or the patient ID.</p>
      )}

      {modal.type === "upload" && (
        <div className="screen-overlay medrec-overlay" onClick={() => setModal({ type: "none" })}>
          <div className="modal-card medrec-modal-upload" onClick={stop}>
            <div className="modal-content medrec-upload-inner">
              <button type="button" className="close-modal icon-btn" onClick={() => setModal({ type: "none" })} aria-label="Close">
                <X size={18} />
              </button>
              <h2 className="medrec-upload-title">Upload Healthcare Document</h2>
              <p className="medrec-upload-sub">Select a file category to continue</p>

              <div className="medrec-cat-grid">
                <button
                  type="button"
                  className={`medrec-cat ${uploadCat === "prescription" ? "is-on" : ""}`}
                  onClick={() => setUploadCat("prescription")}
                >
                  <Pill size={22} strokeWidth={2} />
                  Prescriptions
                </button>
                <button type="button" className={`medrec-cat ${uploadCat === "image" ? "is-on" : ""}`} onClick={() => setUploadCat("image")}>
                  <FileImage size={22} strokeWidth={2} />
                  Image Reports
                </button>
                <button type="button" className={`medrec-cat ${uploadCat === "text" ? "is-on" : ""}`} onClick={() => setUploadCat("text")}>
                  <FileText size={22} strokeWidth={2} />
                  Text Reports
                </button>
              </div>

              {uploadCat === "prescription" ? (
                <label className="medrec-field">
                  <span>Doctor Name</span>
                  <input className="medrec-input" value={uploadDoctor} onChange={(e) => setUploadDoctor(e.target.value)} />
                </label>
              ) : (
                <label className="medrec-field">
                  <span>Report Name</span>
                  <input className="medrec-input" value={uploadReportName} onChange={(e) => setUploadReportName(e.target.value)} />
                </label>
              )}

              <label className="medrec-field">
                <span>Date</span>
                <input className="medrec-input" type="date" value={uploadDate} onChange={(e) => setUploadDate(e.target.value)} />
              </label>

              <div className="medrec-field">
                <span>Clinic Type</span>
                <div className="medrec-clinic-toggle">
                  <button type="button" className={!uploadClinicSh ? "is-on" : ""} onClick={() => setUploadClinicSh(false)}>
                    Other
                  </button>
                  <button type="button" className={uploadClinicSh ? "is-on" : ""} onClick={() => setUploadClinicSh(true)}>
                    S&amp;H Clinic
                  </button>
                </div>
              </div>

              <p className="medrec-drop-lbl">{uploadCat === "prescription" ? "Upload prescription" : "Upload file"}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept={UPLOAD_ACCEPT}
                className="medrec-drop-input"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleUploadFile(file);
                }}
              />
              <div
                className={`medrec-dropzone${isDragOver ? " is-dragover" : ""}${uploadFile ? " has-file" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragEnter={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsDragOver(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsDragOver(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsDragOver(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsDragOver(false);
                  const file = event.dataTransfer.files?.[0];
                  if (file) handleUploadFile(file);
                }}
              >
                {uploadPreviewUrl ? (
                  <img src={uploadPreviewUrl} alt="" className="medrec-drop-preview" />
                ) : (
                  <Upload size={24} strokeWidth={2} className="medrec-drop-ico" aria-hidden />
                )}
                {uploadFile ? (
                  <>
                    <strong>{uploadFile.name}</strong>
                    <span>{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <button
                      type="button"
                      className="medrec-drop-clear"
                      onClick={(event) => {
                        event.stopPropagation();
                        clearUploadSelection();
                      }}
                    >
                      Remove file
                    </button>
                  </>
                ) : (
                  <>
                    <strong>Click to upload or drag and drop</strong>
                    <span>PDF, JPG or PNG (max. 10MB)</span>
                  </>
                )}
              </div>
              {uploadError ? <p className="medrec-upload-error">{uploadError}</p> : null}

              <div className="medrec-autoid">
                <span className="medrec-autoid-label">AUTO-GENERATED ID</span>
                <code>{autoId}</code>
                <button type="button" className="medrec-copy" onClick={copyId}>
                  <Copy size={14} strokeWidth={2} />
                  copy
                </button>
              </div>

              <div className="medrec-modal-actions">
                <button type="button" className="pill-btn light" onClick={() => setModal({ type: "none" })}>
                  Cancel
                </button>
                <button type="button" className="pill-btn dark pill-btn-navy" onClick={saveUpload}>
                  Save &amp; Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal.type === "viewer" && (
        <div className="screen-overlay medrec-overlay" onClick={() => setModal({ type: "none" })}>
          <div className="modal-card medrec-viewer-card" onClick={stop}>
            <div className="modal-content medrec-viewer-inner">
              <header className="medrec-viewer-head">
                <div className="medrec-viewer-file">
                  <span className="medrec-pdf-ico" aria-hidden>
                    {modal.previewUrl ? "IMG" : "PDF"}
                  </span>
                  <span>{modal.fileName}</span>
                </div>
                <button type="button" className="close-modal icon-btn" onClick={() => setModal({ type: "none" })} aria-label="Close">
                  <X size={18} />
                </button>
              </header>
              {!modal.previewUrl ? (
                <div className="medrec-viewer-toolbar">
                  <button type="button" className="medrec-page-nav" aria-label="Previous page" onClick={() => setViewerPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft size={18} />
                  </button>
                  <label className="medrec-page-input">
                    <input
                      type="number"
                      min={1}
                      max={viewerTotal}
                      value={viewerPage}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isFinite(n)) setViewerPage(Math.min(viewerTotal, Math.max(1, n)));
                      }}
                    />
                    <span>of {viewerTotal}</span>
                  </label>
                  <button
                    type="button"
                    className="medrec-page-nav"
                    aria-label="Next page"
                    onClick={() => setViewerPage((p) => Math.min(viewerTotal, p + 1))}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              ) : null}
              <div className="medrec-viewer-canvas">
                {modal.previewUrl ? (
                  <img src={modal.previewUrl} alt={modal.fileName} className="medrec-viewer-image" />
                ) : (
                  <div className="medrec-fake-page">
                    <div className="medrec-fake-bar w100" />
                    <div className="medrec-fake-bar w80" />
                    <div className="medrec-fake-split">
                      <div className="medrec-fake-box blue">
                        <span className="medrec-fake-circle" />
                      </div>
                      <div className="medrec-fake-box green">
                        <span className="medrec-fake-line" />
                        <span className="medrec-fake-line" />
                        <span className="medrec-fake-line short" />
                      </div>
                    </div>
                    <div className="medrec-fake-bar w90" />
                    <div className="medrec-fake-bar w70" />
                  </div>
                )}
              </div>
              <p className="medrec-viewer-foot">PROTECTED DOCUMENT • VIEW-ONLY MODE</p>
            </div>
          </div>
        </div>
      )}

      {modal.type === "delete" && (
        <div className="screen-overlay medrec-overlay" onClick={() => setModal({ type: "none" })}>
          <div className="modal-card medrec-modal-danger" onClick={stop}>
            <div className="modal-content medrec-del-inner">
              <button type="button" className="close-modal icon-btn" onClick={() => setModal({ type: "none" })} aria-label="Close">
                <X size={18} />
              </button>
              <div className="medrec-del-title">
                <AlertTriangle className="medrec-del-warn" size={22} strokeWidth={2} />
                <h2>Delete document?</h2>
              </div>
              <p className="medrec-del-body">{deleteBody(modal.labelType)}</p>
              <div className="medrec-del-filebox">
                <FileText size={20} strokeWidth={2} />
                <div>
                  <span className="medrec-del-kind">{modal.labelType}</span>
                  <strong>{modal.fileName}</strong>
                </div>
              </div>
              <div className="medrec-modal-actions">
                <button type="button" className="pill-btn light" onClick={() => setModal({ type: "none" })}>
                  Cancel
                </button>
                <button type="button" className="pill-btn danger medrec-del-confirm" onClick={() => confirmDelete(modal)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal.type === "vitals" && (
        <div className="screen-overlay medrec-overlay" onClick={() => setModal({ type: "none" })}>
          <div className="modal-card medrec-modal-vitals" onClick={stop}>
            <div className="modal-content medrec-vitals-inner">
              <button type="button" className="close-modal icon-btn" onClick={() => setModal({ type: "none" })} aria-label="Close">
                <X size={18} />
              </button>
              <div className="medrec-vitals-patient">
                <div>
                  <h2 className="medrec-vitals-name">John Doe</h2>
                  <p className="medrec-vitals-line">
                    <UserRound size={14} /> Male, 42 Years
                    <span className="medrec-dot">·</span>
                    <Phone size={14} /> Ph: 1234567890
                    <span className="medrec-pid-badge">PID-0990</span>
                  </p>
                </div>
                <div className="medrec-vitals-sched">
                  <span>SCHEDULED FOR</span>
                  <strong>
                    <Stethoscope size={14} strokeWidth={2} /> Dr. Amelia Thorne
                  </strong>
                </div>
              </div>

              <div className="medrec-vitals-block">
                <div className="medrec-vitals-block-h">
                  <span>
                    <Activity size={16} /> Vitals Intake
                  </span>
                  <span className="medrec-vitals-time">CURRENT ENTRY {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="medrec-vitals-grid">
                  <label className="medrec-vi">
                    <span>
                      <Ruler size={14} /> Height (cm)
                    </span>
                    <input value={vitals.height} onChange={(e) => setVitals((v) => ({ ...v, height: e.target.value }))} />
                  </label>
                  <label className="medrec-vi">
                    <span>
                      <Scale size={14} /> Weight (kg)
                    </span>
                    <input value={vitals.weight} onChange={(e) => setVitals((v) => ({ ...v, weight: e.target.value }))} />
                  </label>
                  <label className="medrec-vi medrec-vi-span2">
                    <span>
                      <Activity size={14} /> BMI (Auto)
                    </span>
                    <input readOnly value={bmi} />
                  </label>
                  <label className="medrec-vi">
                    <span>
                      <HeartPulse size={14} /> Pulse Rate (bpm)
                    </span>
                    <input value={vitals.pulse} onChange={(e) => setVitals((v) => ({ ...v, pulse: e.target.value }))} />
                  </label>
                  <label className="medrec-vi">
                    <span>SpO₂ (%)</span>
                    <input value={vitals.spo2} onChange={(e) => setVitals((v) => ({ ...v, spo2: e.target.value }))} />
                  </label>
                </div>
                <label className="medrec-vitals-ta">
                  <span>Complaints &amp; remarks</span>
                  <textarea
                    rows={3}
                    placeholder="Enter observations (e.g., patient complained of slight headache...)"
                    value={vitals.complaints}
                    onChange={(e) => setVitals((v) => ({ ...v, complaints: e.target.value }))}
                  />
                </label>
              </div>

              <div className="medrec-vitals-footer">
                <button
                  type="button"
                  className="medrec-clear"
                  onClick={() => setVitals({ height: "", weight: "", pulse: "", spo2: "", complaints: "" })}
                >
                  Clear All
                </button>
                <button
                  type="button"
                  className="pill-btn dark pill-btn-navy medrec-vitals-primary"
                  onClick={() => setModal({ type: "none" })}
                >
                  Generate &amp; Send to queue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal.type === "apt" && (
        <div className="screen-overlay medrec-overlay" onClick={() => setModal({ type: "none" })}>
          <div className="modal-card medrec-modal-apt" onClick={stop}>
            <div className="modal-content medrec-apt-inner">
              <header className="medrec-apt-banner">
                <div className="medrec-apt-banner-p">
                  <span className="medrec-apt-mini-av">SJ</span>
                  <div>
                    <span className="medrec-apt-k">PATIENT</span>
                    <strong>Sarah Jenkins</strong>
                  </div>
                </div>
                <button type="button" className="medrec-apt-x" onClick={() => setModal({ type: "none" })} aria-label="Close">
                  <X size={18} />
                </button>
              </header>
              <div className="medrec-apt-body">
                <h3 className="medrec-apt-title">
                  <CheckCircle2 size={18} className="medrec-apt-check" /> APT Confirmation
                </h3>
                <ul className="medrec-apt-meta">
                  <li>
                    <Stethoscope size={15} /> Dr. Michael Chen
                  </li>
                  <li>
                    <Bookmark size={15} /> APT ID: APT-882941-X
                  </li>
                  <li>
                    <CalendarDays size={15} /> Fri, Oct 27, 2023 • 02:15 PM
                  </li>
                </ul>
                <div className="medrec-apt-vitals">
                  <label className="medrec-vi">
                    <span>
                      <Ruler size={14} /> Height (cm)
                    </span>
                    <input value={aptVitals.height} onChange={(e) => setAptVitals((v) => ({ ...v, height: e.target.value }))} />
                  </label>
                  <label className="medrec-vi">
                    <span>
                      <Scale size={14} /> Weight (kg)
                    </span>
                    <input value={aptVitals.weight} onChange={(e) => setAptVitals((v) => ({ ...v, weight: e.target.value }))} />
                  </label>
                  <label className="medrec-vi">
                    <span>
                      <HeartPulse size={14} /> Pulse (bpm)
                    </span>
                    <input value={aptVitals.pulse} onChange={(e) => setAptVitals((v) => ({ ...v, pulse: e.target.value }))} />
                  </label>
                  <label className="medrec-vi">
                    <span>SpO₂ (%)</span>
                    <input value={aptVitals.spo2} onChange={(e) => setAptVitals((v) => ({ ...v, spo2: e.target.value }))} />
                  </label>
                </div>
                <button type="button" className="pill-btn dark pill-btn-navy medrec-apt-send" onClick={() => setModal({ type: "none" })}>
                  Send to queue
                </button>
                <button type="button" className="pill-btn light medrec-apt-cancel" onClick={() => setModal({ type: "none" })}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
