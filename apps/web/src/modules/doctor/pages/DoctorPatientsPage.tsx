import { CalendarDays, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/core/http";

type Patient = {
  id: string;
  patient_code: string;
  first_name: string;
  last_name: string;
  mobile: string;
  email?: string;
  gender: string;
  date_of_birth: string;
};

type MedicalRecord = {
  id: string;
  created_at: string;
  ref_code: string;
  title: string;
  record_type: string;
};

function calculateAge(dateOfBirth: string): string {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.valueOf())) return "-";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasBirthdayPassed) age -= 1;
  return `${Math.max(0, age)} years old`;
}

export function DoctorPatientsPage() {
  const [tab, setTab] = useState<"overview" | "prescriptions" | "lab">("prescriptions");
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      apiRequest<{ items: Patient[] }>(`/patients?search=${encodeURIComponent(query)}&page=1&pageSize=30`)
        .then((resp) => {
          setPatients(resp.items);
          setSelectedPatientId((current) => current || resp.items[0]?.id || "");
        })
        .catch(() => setError("Unable to load patients."));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!selectedPatientId) return;
    apiRequest<MedicalRecord[]>(`/medical-records?patientId=${selectedPatientId}`)
      .then(setRecords)
      .catch(() => setRecords([]));
  }, [selectedPatientId]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  const filteredRecords = useMemo(() => {
    if (tab === "prescriptions") {
      return records.filter((record) => record.record_type === "prescription");
    }
    if (tab === "lab") {
      return records.filter((record) => record.record_type.includes("report"));
    }
    return records;
  }, [records, tab]);

  return (
    <div className="doctor-screen doctor-patient-page">
      <header className="doctor-page-head doctor-page-head-spread">
        <h1>
          Patient:{" "}
          {selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "Select a patient"}
        </h1>
        <button type="button" className="doctor-outline-btn">
          <CalendarDays size={15} strokeWidth={2} />
          New prescription
        </button>
      </header>

      <div className="doctor-patient-grid">
        <aside className="doctor-patient-profile">
          <span className="doctor-patient-avatar">
            {selectedPatient
              ? `${selectedPatient.first_name[0] ?? ""}${selectedPatient.last_name[0] ?? ""}`
              : "--"}
          </span>
          <h2>
            {selectedPatient
              ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
              : "No patient selected"}
          </h2>
          <p>{selectedPatient?.patient_code ?? "—"}</p>
          <ul>
            <li>{selectedPatient ? calculateAge(selectedPatient.date_of_birth) : "—"}</li>
            <li>{selectedPatient?.mobile ?? "—"}</li>
            <li>{selectedPatient?.email ?? "NA"}</li>
            <li>{selectedPatient?.gender ?? "—"}</li>
          </ul>
        </aside>

        <section className="doctor-patient-main">
          <div className="doctor-search-row">
            <label className="doctor-search-field">
              <Search size={15} strokeWidth={2} />
              <input
                placeholder="Search patient..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="doctor-search-field">
              <Search size={15} strokeWidth={2} />
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patient_code} - {patient.first_name} {patient.last_name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="doctor-tabbar">
            <button type="button" className={tab === "overview" ? "is-active" : ""} onClick={() => setTab("overview")}>
              Overview
            </button>
            <button
              type="button"
              className={tab === "prescriptions" ? "is-active" : ""}
              onClick={() => setTab("prescriptions")}
            >
              Prescriptions
            </button>
            <button type="button" className={tab === "lab" ? "is-active" : ""} onClick={() => setTab("lab")}>
              Lab Results
            </button>
          </div>

          <div className="doctor-table-card">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference ID</th>
                  <th>Title</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.created_at).toLocaleDateString()}</td>
                    <td>{row.ref_code}</td>
                    <td>{row.title}</td>
                    <td>
                      <button type="button" className="doctor-table-view">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {error ? <p className="lab-login-note">{error}</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
