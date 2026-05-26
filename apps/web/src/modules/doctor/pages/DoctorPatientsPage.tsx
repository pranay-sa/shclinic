import { CalendarDays, Search } from "lucide-react";
import { useState } from "react";

const patientRows = [
  { date: "23-11-2025", id: "XXXXXXXXXXXX", doctor: "Dr. Johnson" },
  { date: "24-09-2025", id: "XXXXXXXXXXXX", doctor: "Dr. Smith" },
  { date: "27-07-2025", id: "XXXXXXXXXXXX", doctor: "Dr. Alex Johnson" },
  { date: "20-03-2025", id: "XXXXXXXXXXXX", doctor: "Dr. Chen" }
];

export function DoctorPatientsPage() {
  const [tab, setTab] = useState<"overview" | "prescriptions" | "lab">("prescriptions");

  return (
    <div className="doctor-screen doctor-patient-page">
      <header className="doctor-page-head doctor-page-head-spread">
        <h1>Patient: Fatima Khan</h1>
        <button type="button" className="doctor-outline-btn">
          <CalendarDays size={15} strokeWidth={2} />
          New prescription
        </button>
      </header>

      <div className="doctor-patient-grid">
        <aside className="doctor-patient-profile">
          <span className="doctor-patient-avatar">FK</span>
          <h2>Fatima Khan</h2>
          <p>PID-78901</p>
          <ul>
            <li>34 years old</li>
            <li>+911212093000</li>
            <li>emily.davis@example.com</li>
            <li>Female</li>
          </ul>
        </aside>

        <section className="doctor-patient-main">
          <div className="doctor-search-row">
            <label className="doctor-search-field">
              <Search size={15} strokeWidth={2} />
              <input placeholder="Search patient..." />
            </label>
            <label className="doctor-search-field">
              <Search size={15} strokeWidth={2} />
              <input placeholder="Search by date..." />
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
                  <th>Prescription ID</th>
                  <th>Prescribed By</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {patientRows.map((row) => (
                  <tr key={`${row.date}-${row.id}`}>
                    <td>{row.date}</td>
                    <td>{row.id}</td>
                    <td>{row.doctor}</td>
                    <td>
                      <button type="button" className="doctor-table-view">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
