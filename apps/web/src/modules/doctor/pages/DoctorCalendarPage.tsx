import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { apiRequest } from "@/core/http";
import { authStore } from "@/core/auth";

type AppointmentRow = {
  id: string;
  appointment_code: string;
  appointment_date: string;
  slot_time: string;
  status: "booked" | "in_progress" | "done" | "cancelled";
  first_name: string;
  last_name: string;
};

const slots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

function toApiDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSlot(slot: string): string {
  const [hour, minute] = slot.split(":");
  const h = Number(hour);
  const suffix = h >= 12 ? "PM" : "AM";
  const normalized = h % 12 === 0 ? 12 : h % 12;
  return `${String(normalized).padStart(2, "0")}:${minute} ${suffix}`;
}

export function DoctorCalendarPage() {
  const [mode, setMode] = useState<"day" | "week">("week");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const weekHeaders = useMemo(() => {
    const monday = new Date(selectedDate);
    const day = monday.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + diffToMonday);
    return Array.from({ length: 5 }, (_, index) => {
      const value = new Date(monday);
      value.setDate(monday.getDate() + index);
      return value;
    });
  }, [selectedDate]);

  useEffect(() => {
    const user = authStore.getUser();
    if (!user) return;
    const date = toApiDate(selectedDate);
    apiRequest<AppointmentRow[]>(`/appointments?date=${date}&doctorId=${user.id}`)
      .then(setAppointments)
      .catch(() => setError("Unable to load doctor calendar."));
  }, [selectedDate]);

  const meetings = useMemo(() => {
    const map = new Map<string, AppointmentRow>();
    appointments.forEach((appointment) => {
      map.set(appointment.slot_time.slice(0, 5), appointment);
    });
    return map;
  }, [appointments]);

  const dateLabel = selectedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
              <h2>{dateLabel}</h2>
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
                  Cancelled
                </span>
              </div>
            </div>
            <input
              type="date"
              value={toApiDate(selectedDate)}
              onChange={(e) => setSelectedDate(new Date(`${e.target.value}T00:00:00`))}
            />
          </header>

          <div className="doctor-week-head">
            {(mode === "week" ? weekHeaders : [selectedDate]).map((day) => (
              <span key={day.toISOString()}>{day.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</span>
            ))}
          </div>

          <div className="doctor-week-grid">
            {slots.map((slot) => (
              <div key={slot} className="doctor-week-row">
                <span>{formatSlot(slot)}</span>
                {(mode === "week" ? weekHeaders : [selectedDate]).map((day, colIdx) => {
                  const dayKey = toApiDate(day);
                  const appointment = dayKey === toApiDate(selectedDate) ? meetings.get(slot) : undefined;
                  return (
                    <div key={`${dayKey}-${colIdx}-${slot}`} className="doctor-week-cell">
                      {appointment ? (
                        <div
                          className={`doctor-week-pill ${
                            appointment.status === "done"
                              ? "done"
                              : appointment.status === "in_progress"
                                ? "inprog"
                                : appointment.status === "cancelled"
                                  ? "blocked"
                                  : "booked"
                          }`}
                        >
                          {appointment.first_name} {appointment.last_name} - {formatSlot(slot)}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {error ? <p className="lab-login-note">{error}</p> : null}
        </section>

        <aside className="doctor-notes-panel">
          <div className="doctor-notes-head">
            <h3>Notes on availability</h3>
            <button type="button">
              <Plus size={14} strokeWidth={2.3} />
            </button>
          </div>
          <p>Date {dateLabel}</p>
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
