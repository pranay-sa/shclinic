import { CalendarDays, Eye, Pencil, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const prescriptions = [
  { date: "2023-10-26", name: "Alice Smith", id: "PRX001" },
  { date: "2023-10-26", name: "Alice Smith", id: "PRX001" },
  { date: "2023-10-26", name: "Alice Smith", id: "PRX001" },
  { date: "2023-10-26", name: "Alice Smith", id: "PRX001" },
  { date: "2023-10-26", name: "Alice Smith", id: "PRX001" }
];

const waitingPatients = [
  { id: "VS1-2309-A1", name: "Eleanor Pena", age: "45y, F", vitals: "120/80 72 bpm 98% O2 65 kg" },
  { id: "VST-2309-B4", name: "Marvin McKinney", age: "62y, M", vitals: "145/90 88 bpm 96% O2 82 kg" },
  { id: "VST-2309-C2", name: "Savannah Nguyen", age: "28y, F", vitals: "110/70 65 bpm 100% O2 55 kg" },
  { id: "VST-2309-DB", name: "Albert Flores", age: "35y, M", vitals: "130/85 75 bpm 97% O2 90 kg" }
];

export function DoctorPrescriptionLogPage() {
  const navigate = useNavigate();
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState("VST-2309-B4");

  return (
    <div className="doctor-screen doctor-rx-screen">
      <header className="doctor-rx-top">
        <div>Downtown Medical Center</div>
        <h1>Dr Sandeep Reddy</h1>
      </header>

      <div className="doctor-rx-grid">
        <section className="doctor-rx-log">
          <div className="doctor-rx-log-head">
            <h2>Log</h2>
            <label className="doctor-search-field">
              <Search size={15} />
              <input placeholder="Search prescription" />
            </label>
            <button type="button" className="doctor-outline-btn doctor-outline-small">
              <CalendarDays size={14} />
              Date Range
            </button>
          </div>

          <button type="button" className="doctor-primary-btn" onClick={() => setShowPicker(true)}>
            + New Prescription
          </button>

          <div className="doctor-rx-list">
            {prescriptions.map((item, index) => (
              <article key={`${item.id}-${index}`} className="doctor-rx-item">
                <div>
                  <p>{item.date}</p>
                  <small>{item.id}</small>
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <div className="doctor-rx-item-actions">
                    <button type="button" aria-label="view">
                      <Eye size={14} />
                    </button>
                    <button type="button" aria-label="edit">
                      <Pencil size={14} />
                    </button>
                    <button type="button" aria-label="download">
                      v
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button type="button" className="doctor-outline-btn doctor-load-more">
            Load more
          </button>
        </section>

        <section className="doctor-rx-preview">
          <h2>Preview</h2>
          <div>Preview of the prescription</div>
        </section>
      </div>

      {showPicker ? (
        <div className="doctor-modal-backdrop" onClick={() => setShowPicker(false)}>
          <div className="doctor-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Select Next Patient</h3>
            <p>4 patients currently waiting for consultation</p>
            <label className="doctor-search-field">
              <Search size={15} />
              <input placeholder="Search by name or visit no..." />
            </label>
            <div className="doctor-modal-table-head">
              <span>Patient Details</span>
              <span>Vitals Summary</span>
            </div>
            <div className="doctor-modal-list">
              {waitingPatients.map((patient) => (
                <label key={patient.id} className="doctor-modal-row">
                  <input
                    type="radio"
                    name="selectedPatient"
                    checked={selected === patient.id}
                    onChange={() => setSelected(patient.id)}
                  />
                  <div>
                    <strong>{patient.name}</strong>
                    <small>
                      {patient.age} | {patient.id}
                    </small>
                  </div>
                  <span>{patient.vitals}</span>
                </label>
              ))}
            </div>
            <div className="doctor-modal-actions">
              <button type="button" className="doctor-outline-btn" onClick={() => setShowPicker(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="doctor-primary-btn"
                onClick={() => {
                  setShowPicker(false);
                  navigate("/doctor/consultation");
                }}
              >
                Start Consultation
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
