import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

const weekHeaders = ["Mon 9", "Tue 10", "Wed 11", "Thu 12", "Fri 13"];
const slots = [
  "07:00 AM",
  "07:10 AM",
  "07:20 AM",
  "07:30 AM",
  "07:40 AM",
  "07:50 AM",
  "08:00 AM",
  "08:10 AM",
  "08:20 AM",
  "08:30 AM",
  "08:40 AM",
  "08:50 AM",
  "09:00 AM",
  "09:10 AM",
  "09:20 AM",
  "09:30 AM",
  "09:40 AM",
  "09:50 AM",
  "10:00 AM",
  "10:10 AM",
  "10:20 AM"
];

const meetings: Record<string, { label: string; kind: string }> = {
  "0-0": { label: "John Doe - 07:00 am", kind: "done" },
  "1-5": { label: "Jane Smith - 07:50 am", kind: "booked" },
  "1-6": { label: "Jane Smith - 08:00 am", kind: "inprog" },
  "2-15": { label: "Pratham Verma - 09:30 am", kind: "booked2" },
  "2-16": { label: "Robert Brown - 09:40 am", kind: "blocked" }
};

export function DoctorCalendarPage() {
  const [mode, setMode] = useState<"day" | "week">("week");
  const [notes, setNotes] = useState("");
  const noteId = useMemo(() => `Dr-332224-${new Date().getDate()}312-${notes.length || 1}`, [notes.length]);

  return (
    <div className="doctor-screen">
      <header className="doctor-page-head">
        <h1>Calendar</h1>
        <div className="doctor-mode-toggle">
          <button type="button" className={mode === "day" ? "is-active" : ""} onClick={() => setMode("day")}>
            Day
          </button>
          <button type="button" className={mode === "week" ? "is-active" : ""} onClick={() => setMode("week")}>
            Week
          </button>
        </div>
      </header>

      <div className="doctor-calendar-layout">
        <section className="doctor-calendar-board">
          <header className="doctor-calendar-board-head">
            <div>
              <h2>Dec, 2022</h2>
              <div className="doctor-calendar-legend">
                <span>
                  <i className="dot booked" />
                  Booked
                </span>
                <span>
                  <i className="dot inprog" />
                  In progress
                </span>
                <span>
                  <i className="dot done" />
                  Done
                </span>
                <span>
                  <i className="dot blocked" />
                  Blocked
                </span>
              </div>
            </div>
          </header>

          <div className="doctor-week-head">
            {weekHeaders.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="doctor-week-grid">
            {slots.map((slot, rowIdx) => (
              <div key={slot} className="doctor-week-row">
                <span>{slot}</span>
                {weekHeaders.map((_, colIdx) => {
                  const key = `${colIdx}-${rowIdx}`;
                  const item = meetings[key];
                  return (
                    <div key={key} className="doctor-week-cell">
                      {item ? <div className={`doctor-week-pill ${item.kind}`}>{item.label}</div> : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <aside className="doctor-notes-panel">
          <div className="doctor-notes-head">
            <h3>Notes on availability</h3>
            <button type="button">
              <Plus size={14} strokeWidth={2.3} />
            </button>
          </div>
          <p>Note ID&nbsp;&nbsp;&nbsp;&nbsp;{noteId}</p>
          <p>Date&nbsp;&nbsp;&nbsp;&nbsp;23-11-2025</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add doctor availability notes here..."
          />
        </aside>
      </div>
    </div>
  );
}
