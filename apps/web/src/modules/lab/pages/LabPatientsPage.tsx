import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Pencil,
  Search,
  Upload,
  UserRound,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

type ReportsTab = "text" | "image" | "bills";
type PreviewFile = { name: string; kind: "pdf" | "image" } | null;
type PendingKind = "text" | "image" | null;

type ReportRow = {
  id: string;
  date: string;
  title: string;
  canEdit?: boolean;
  previewName: string;
  imageUrl?: string;
};

const patients = [
  { id: "PID-8821", name: "Alexander Thompson", info: "39y · Male", color: "violet" },
  { id: "PID-4492", name: "Sarah Jenkins", info: "32y · Female", color: "mint" },
  { id: "PID-1029", name: "Michael Chen", info: "46y · Male", color: "violet" },
  { id: "PID-7731", name: "Emily Rodriguez", info: "22y · Female", color: "mint" },
  { id: "PID-3345", name: "Robert Wilson", info: "59y · Male", color: "violet" },
  { id: "PID-1029", name: "Michael Chen", info: "46y · Male", color: "violet" }
];

const textRows: ReportRow[] = [
  {
    id: "txt-2023-11-20",
    date: "2023-11-20",
    title: "Complete Blood Count/Lipid Profile",
    canEdit: true,
    previewName: "report.pdf"
  },
  {
    id: "txt-2023-11-19",
    date: "2023-11-19",
    title: "HbA1c",
    canEdit: true,
    previewName: "report.pdf"
  },
  {
    id: "txt-2023-09-19",
    date: "2023-09-19",
    title: "HbA1c",
    previewName: "report.pdf"
  },
  {
    id: "txt-2023-07-09",
    date: "2023-07-09",
    title: "HbA1c/Lipid Profile",
    previewName: "report.pdf"
  }
];

const imageRows: ReportRow[] = [
  {
    id: "img-2023-11-20-xray",
    date: "2023-11-20",
    title: "Chest X-Ray",
    canEdit: true,
    previewName: "report.png",
    imageUrl:
      "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "img-2023-11-20-abd",
    date: "2023-11-20",
    title: "Abdominal Ultrasound",
    canEdit: true,
    previewName: "report.png",
    imageUrl:
      "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "img-2023-09-19-ct",
    date: "2023-09-19",
    title: "CT Lumbar Spine",
    previewName: "report.png",
    imageUrl:
      "https://images.unsplash.com/photo-1584555613497-9ecf2d54fc43?auto=format&fit=crop&w=1200&q=80"
  }
];

const billsRows: ReportRow[] = [
  { id: "bill-1", date: "2023-11-20", title: "INV-2023-001", previewName: "bill_one.pdf" },
  { id: "bill-2", date: "2023-11-19", title: "INV-2023-001", previewName: "bill_one.pdf" },
  { id: "bill-3", date: "2023-09-19", title: "INV-2023-001", previewName: "bill_one.pdf" },
  { id: "bill-4", date: "2023-07-09", title: "INV-2023-001", previewName: "bill_one.pdf" }
];

export function LabPatientsPage() {
  const [activeTab, setActiveTab] = useState<ReportsTab>("text");
  const [previewFile, setPreviewFile] = useState<PreviewFile>(null);
  const [pendingReportKind, setPendingReportKind] = useState<PendingKind>(null);

  const rows = useMemo(() => {
    if (activeTab === "image") {
      return imageRows;
    }
    if (activeTab === "bills") {
      return billsRows;
    }
    return textRows;
  }, [activeTab]);

  return (
    <section className="lab-reports-page">
      <div className="lab-reports-main">
        <header className="lab-reports-header">
          <h1>Patients reports directory</h1>
          <label className="lab-reports-search">
            <Search size={14} />
            <input placeholder="Search Patient name/ID" />
          </label>
        </header>

        <div className="lab-reports-tabs">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={activeTab === "text" ? "lab-reports-tab lab-reports-tab-active" : "lab-reports-tab"}
          >
            Text tests
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={activeTab === "image" ? "lab-reports-tab lab-reports-tab-active" : "lab-reports-tab"}
          >
            Image tests
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bills")}
            className={activeTab === "bills" ? "lab-reports-tab lab-reports-tab-active" : "lab-reports-tab"}
          >
            Bills
          </button>
        </div>

        <h2 className="lab-reports-section-title">
          <FileText size={16} />
          Text Test Results
        </h2>

        <div className="lab-reports-list">
          {rows.map((row) => (
            <article key={row.id} className="lab-reports-date-group">
              <p className="lab-reports-date">{row.date}</p>
              <div
                className={row.imageUrl ? "lab-reports-row lab-reports-row-image" : "lab-reports-row"}
                style={row.imageUrl ? { backgroundImage: `url(${row.imageUrl})` } : undefined}
              >
                <div className="lab-reports-row-title">{row.title}</div>
                <div className="lab-reports-actions">
                  {row.canEdit ? (
                    <button
                      type="button"
                      className="lab-reports-edit-btn"
                      onClick={() => setPendingReportKind(activeTab === "image" ? "image" : "text")}
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="lab-reports-action-btn"
                    onClick={() =>
                      setPreviewFile({
                        name: row.previewName,
                        kind: activeTab === "image" ? "image" : "pdf"
                      })
                    }
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="lab-reports-action-btn"
                    onClick={() =>
                      setPreviewFile({
                        name: row.previewName,
                        kind: activeTab === "image" ? "image" : "pdf"
                      })
                    }
                  >
                    <Download size={12} />
                    Download
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="lab-reports-patient-list">
        {patients.map((patient, index) => (
          <button
            type="button"
            key={`${patient.id}-${index}`}
            className={index === 0 ? "lab-reports-patient-card lab-reports-patient-card-active" : "lab-reports-patient-card"}
          >
            <span
              className={
                patient.color === "mint" ? "lab-reports-patient-avatar lab-reports-patient-avatar-mint" : "lab-reports-patient-avatar"
              }
            >
              <UserRound size={14} />
            </span>
            <span className="lab-reports-patient-text">
              <strong>{patient.name}</strong>
              <small>
                {patient.info} @ {patient.id}
              </small>
            </span>
          </button>
        ))}
      </aside>

      {previewFile || pendingReportKind ? (
        <button
          type="button"
          className="lab-dialog-backdrop"
          onClick={() => {
            setPreviewFile(null);
            setPendingReportKind(null);
          }}
        />
      ) : null}

      {previewFile ? (
        <article className="lab-doc-preview-modal">
          <header className="lab-doc-preview-top">
            <div className="lab-doc-preview-file">
              <span className="lab-doc-file-icon">
                <FileText size={12} />
              </span>
              {previewFile.name}
            </div>
            <button type="button" onClick={() => setPreviewFile(null)} aria-label="Close preview">
              <X size={15} />
            </button>
          </header>

          <div className="lab-doc-preview-nav">
            <button type="button" aria-label="Previous page">
              <ChevronLeft size={14} />
            </button>
            <span>1</span>
            <small>of 24</small>
            <button type="button" aria-label="Next page">
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="lab-doc-preview-canvas">
            <div className="lab-doc-skeleton-page">
              <div className="lab-doc-line lab-doc-line-sm" />
              <div className="lab-doc-line lab-doc-line-xs" />
              <div className="lab-doc-line lab-doc-line-lg" />
              <div className="lab-doc-blocks">
                <div className="lab-doc-block-blue">
                  <div className="lab-doc-blue-circle" />
                </div>
                <div className="lab-doc-block-green">
                  <div className="lab-doc-line lab-doc-line-mid" />
                  <div className="lab-doc-line lab-doc-line-mid" />
                  <div className="lab-doc-line lab-doc-line-mid-short" />
                </div>
              </div>
              <div className="lab-doc-line lab-doc-line-xs" />
              <div className="lab-doc-line lab-doc-line-xl" />
              <div className="lab-doc-line lab-doc-line-xl" />
            </div>
          </div>

          <footer className="lab-doc-preview-foot">PROTECTED DOCUMENT · VIEW-ONLY MODE</footer>
        </article>
      ) : null}

      {pendingReportKind ? (
        <article className="lab-pending-modal">
          <header className="lab-pending-modal-head">
            <p>Pending Report</p>
            <h3>Eleanor Vance</h3>
            <small>PID-2024-8842</small>
          </header>

          <div className="lab-pending-modal-grid">
            <p>
              <span>TEST NAMES</span>
              {pendingReportKind === "image" ? "2D ECHO" : "Full Blood Count (FBC) with Differential"}
            </p>
            <p>
              <span>SAMPLE IDS</span>
              SMP-1049/SMP-106A
            </p>
            <p>
              <span>ORDER ID</span>
              ORD-20231108-882
            </p>
          </div>

          <div className="lab-pending-meta-row">
            <p>Report Time: Oct 24, 2023 · 11:50 AM</p>
            <select defaultValue="">
              <option value="">Phlebotomist staff name</option>
              <option value="anand">Anand Kulkarni</option>
              <option value="reena">Reena Shah</option>
            </select>
          </div>

          <p className="lab-pending-upload-ok">
            <CheckCircle2 size={14} />
            Upload successful
          </p>

          <p className="lab-pending-uploads-label">EXISTING UPLOADS</p>
          <div className="lab-pending-existing-file">
            <div>
              <strong>{pendingReportKind === "image" ? "2d echo" : "CBC/LP ORD-20231108-882"}</strong>
              <small>Oct 24, 11:55 PM</small>
            </div>
            <span>RID-100520260098</span>
            <button type="button" aria-label="Remove file">
              <X size={12} />
            </button>
          </div>

          <label className="lab-pending-upload-box">
            <Upload size={16} />
            <strong>Upload New Version</strong>
            <small>PDF, PNG, JPEG, JPG (Max: 10mb per file)</small>
          </label>

          <button type="button" className="lab-pending-submit" onClick={() => setPendingReportKind(null)}>
            Generate Report &amp; Completed
          </button>
        </article>
      ) : null}
    </section>
  );
}
