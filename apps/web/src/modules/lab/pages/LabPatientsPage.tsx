import { Download, FileText, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/core/http";

type ReportsTab = "text" | "image" | "bills";

type Patient = {
  id: string;
  patient_code: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
};

type RecordItem = {
  id: string;
  created_at: string;
  title: string;
  ref_code: string;
  record_type: "prescription" | "bill" | "image_report" | "text_report";
  file_name: string;
};

function calculateAge(dateOfBirth: string): string {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.valueOf())) return "--";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasBirthdayPassed) age -= 1;
  return `${Math.max(0, age)}y`;
}

export function LabPatientsPage() {
  const [activeTab, setActiveTab] = useState<ReportsTab>("text");
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      apiRequest<{ items: Patient[] }>(`/patients?search=${encodeURIComponent(query)}&page=1&pageSize=30`)
        .then((resp) => {
          setPatients(resp.items);
          setSelectedPatientId((current) => current || resp.items[0]?.id || "");
        })
        .catch(() => setError("Unable to load patient directory."));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!selectedPatientId) return;
    apiRequest<RecordItem[]>(`/medical-records?patientId=${selectedPatientId}`)
      .then(setRecords)
      .catch(() => setRecords([]));
  }, [selectedPatientId]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  const rows = useMemo(() => {
    if (activeTab === "text") {
      return records.filter((record) => record.record_type === "text_report");
    }
    if (activeTab === "image") {
      return records.filter((record) => record.record_type === "image_report");
    }
    return records.filter((record) => record.record_type === "bill");
  }, [activeTab, records]);

  return (
    <section className="lab-reports-page">
      <div className="lab-reports-main">
        <header className="lab-reports-header">
          <h1>Patients reports directory</h1>
          <label className="lab-reports-search">
            <Search size={14} />
            <input
              placeholder="Search Patient name/ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
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
          {activeTab === "bills" ? "Billing Documents" : activeTab === "image" ? "Image Test Results" : "Text Test Results"}
        </h2>

        <div className="lab-reports-list">
          {rows.map((row) => (
            <article key={row.id} className="lab-reports-date-group">
              <p className="lab-reports-date">{new Date(row.created_at).toLocaleDateString()}</p>
              <div className="lab-reports-row">
                <div className="lab-reports-row-title">
                  {row.title} - {row.ref_code}
                </div>
                <div className="lab-reports-actions">
                  <button type="button" className="lab-reports-action-btn">
                    View
                  </button>
                  <button type="button" className="lab-reports-action-btn">
                    <Download size={12} />
                    Download
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {error ? <p className="lab-login-note">{error}</p> : null}
      </div>

      <aside className="lab-reports-patient-list">
        {patients.map((patient) => (
          <button
            type="button"
            key={patient.id}
            className={
              patient.id === selectedPatientId
                ? "lab-reports-patient-card lab-reports-patient-card-active"
                : "lab-reports-patient-card"
            }
            onClick={() => setSelectedPatientId(patient.id)}
          >
            <span className="lab-reports-patient-avatar">
              <UserRound size={14} />
            </span>
            <span className="lab-reports-patient-text">
              <strong>
                {patient.first_name} {patient.last_name}
              </strong>
              <small>
                {calculateAge(patient.date_of_birth)} · {patient.gender} @ {patient.patient_code}
              </small>
            </span>
          </button>
        ))}
        {!selectedPatient ? <p className="lab-login-note">No patient selected.</p> : null}
      </aside>
    </section>
  );
}
