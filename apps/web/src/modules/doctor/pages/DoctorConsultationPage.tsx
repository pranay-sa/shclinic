import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

type AddedMedicine = {
  id: string;
  name: string;
  dosage: string;
  duration: string;
  timing: string;
};

const timingOptions = ["1-0-1", "1-0-0", "0-1-0", "0-0-1", "1-1-0", "1-1-1"];

const initialMedicines: AddedMedicine[] = [
  { id: "m1", name: "Amoxicillin", dosage: "250mg", duration: "7 days", timing: "Anytime" },
  { id: "m2", name: "Tirzepatide", dosage: "2.5mg", duration: "30 days", timing: "After food" },
  { id: "m3", name: "Metformin", dosage: "250mg", duration: "30 days", timing: "Before food" }
];

export function DoctorConsultationPage() {
  const [medicineName, setMedicineName] = useState("Amoxicillin");
  const [dosage, setDosage] = useState("250mg");
  const [duration, setDuration] = useState("7");
  const [timing, setTiming] = useState("1-0-1");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [medicines, setMedicines] = useState(initialMedicines);

  const prescriptionId = useMemo(() => `Prescription ID: Patient ID-followupnumber`, []);

  return (
    <div className="doctor-screen doctor-consult-page">
      <header className="doctor-consult-head">
        <div>
          <h1>Srikar Bajjuri</h1>
          <p>Age: 22 | Gender: Male | Visit No: 1/2/3/4/5</p>
        </div>
        <div>
          <p>Patient ID: format of ID-phonenumber</p>
          <p>{prescriptionId}</p>
        </div>
      </header>

      <section className="doctor-consult-grid">
        <div className="doctor-consult-card">
          <header>
            Vitals <ChevronDown size={14} />
          </header>
          <div className="doctor-mini-grid">
            <label>BP <input placeholder="Input text" /></label>
            <label>Weight <input placeholder="Input text" /></label>
            <label>Height <input placeholder="Input text" /></label>
            <label>SPO2 <input placeholder="Input text" /></label>
          </div>
          <label className="doctor-block-field">
            medical history
            <textarea rows={4} placeholder="Type here" />
          </label>
          <label className="doctor-block-field">
            Complaints
            <textarea rows={5} placeholder="Too much headache" />
          </label>
        </div>

        <div className="doctor-consult-card doctor-dx-card">
          <header>
            Diagnosis <ChevronDown size={14} />
          </header>
          <input className="doctor-wide-input" placeholder="Type here" />
          <input className="doctor-wide-input" placeholder="Search medicines" />
          <div className="doctor-med-row">
            <label>
              medicine name*
              <input value={medicineName} onChange={(e) => setMedicineName(e.target.value)} />
            </label>
            <label>
              Dosage*
              <input value={dosage} onChange={(e) => setDosage(e.target.value)} />
            </label>
            <label>
              Duration
              <input value={duration} onChange={(e) => setDuration(e.target.value)} />
            </label>
          </div>
          <div className="doctor-med-row doctor-med-row-1">
            <label>
              Timings*
              <select value={timing} onChange={(e) => setTiming(e.target.value)}>
                {timingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="doctor-block-field">
            Additional remarks for duration and dosage
            <textarea rows={3} value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder="Input text" />
          </label>
          <button
            type="button"
            className="doctor-primary-btn doctor-add-btn"
            onClick={() => {
              if (!medicineName.trim()) return;
              setMedicines((rows) => [
                {
                  id: `m${Date.now()}`,
                  name: medicineName.trim(),
                  dosage: dosage.trim() || "250mg",
                  duration: `${duration || "7"} days`,
                  timing
                },
                ...rows
              ]);
              setAdditionalNotes("");
            }}
          >
            Add
          </button>

          <div className="doctor-meds-list">
            {medicines.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {item.dosage} • {item.timing}
                  </small>
                </div>
                <span>{item.duration}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="doctor-consult-card doctor-life-card">
          <header>
            Lifestyle Advice <ChevronDown size={14} />
          </header>
          <label>Type here <input placeholder="Type here" /></label>
          <label>Do's <input placeholder="Type here" /></label>
          <label>Dont's <input placeholder="Type here" /></label>
          <label>Smoking Status <input placeholder="Teetooler" /></label>
          <label>Drinking Status <input placeholder="Rarely" /></label>
          <label>Workout Status <input placeholder="Sedentary" /></label>
          <button type="button" className="doctor-outline-btn doctor-outline-small">
            Create Medical Certificate
          </button>
        </div>
      </section>

      <section className="doctor-bottom-grid">
        <div className="doctor-consult-card">
          <h3>Follow-Up Plan</h3>
          <label>Days to next visit <input placeholder="30" /></label>
          <label>Next Visit Date <input placeholder="Thu, Jan 1, 2026" /></label>
          <label>
            Diagnostic Tests / Notes
            <textarea rows={3} placeholder="HbA1c, Fasting Lipid Panel, Renal Function Test" />
          </label>
          <button type="button" className="doctor-primary-btn">
            Add Follow-Up Plan
          </button>
        </div>

        <div className="doctor-consult-card">
          <h3>Referrals</h3>
          <label>
            Department
            <select defaultValue="">
              <option value="" disabled>
                Select Department
              </option>
              <option value="cardiology">Cardiology</option>
              <option value="nephrology">Nephrology</option>
            </select>
          </label>
          <label>Referring Doctor (Optional) <input placeholder="e.g. Dr. Smith" /></label>
          <label>
            Reason For Referral (Optional)
            <textarea rows={3} placeholder="Briefly describe the reason for referral" />
          </label>
          <button type="button" className="doctor-primary-btn">
            Add Referral
          </button>
        </div>
      </section>

      <footer className="doctor-consult-footer">
        <button type="button" className="doctor-outline-btn">
          Prescription
        </button>
        <button type="button" className="doctor-primary-btn">
          Save
        </button>
      </footer>
    </div>
  );
}
