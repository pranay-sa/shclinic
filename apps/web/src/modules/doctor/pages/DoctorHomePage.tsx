import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/core/http";

type DashboardAppointment = {
  appointmentCode: string;
  date: string;
  time: string;
  status: "booked" | "in_progress" | "done" | "cancelled";
  patientName: string;
};

const timeGrid = [
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

export function DoctorHomePage() {
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<{ appointments: DashboardAppointment[] }>("/dashboard/doctor")
      .then((resp) => setAppointments(resp.appointments))
      .catch(() => setError("Unable to load doctor dashboard."));
  }, []);

  const summaryCards = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter((a) => a.status === "booked" || a.status === "in_progress").length;
    const completed = appointments.filter((a) => a.status === "done").length;
    return [
      { title: "Total Appointments", value: String(total), split: [String(total), "0", "0"] },
      { title: "Upcoming Appointments", value: String(upcoming), split: [String(upcoming), "0", "0"] },
      { title: "Completed Appointments", value: String(completed), split: [String(completed), "0", "0"] }
    ];
  }, [appointments]);

  const scheduleRows = useMemo(
    () =>
      appointments.slice(0, 8).map((appointment) => ({
        time: appointment.time,
        label: `${appointment.patientName} - ${appointment.time}`,
        color:
          appointment.status === "done"
            ? "done"
            : appointment.status === "in_progress"
              ? "inprog"
              : appointment.status === "cancelled"
                ? "blocked"
                : "booked",
        span: 4
      })),
    [appointments]
  );

  return (
    <div className="doctor-screen">
      <header className="doctor-home-greeting">
        <span className="doctor-home-avatar">SR</span>
        <div>
          <h1>Good morning, Dr Sandeep Reddy!</h1>
          <p>Endocrinologist - MBBS MD DM</p>
        </div>
      </header>

      <section className="doctor-home-grid">
        <aside className="doctor-home-stats">
          {summaryCards.map((card) => (
            <article key={card.title} className="doctor-stat-card">
              <h3>{card.title}</h3>
              <strong>{card.value}</strong>
              <div className="doctor-stat-split">
                {card.split.map((value, idx) => (
                  <span key={`${card.title}-${idx}`}>{value}</span>
                ))}
              </div>
            </article>
          ))}
        </aside>

        <section className="doctor-home-calendar-card">
          <header className="doctor-calendar-head">
            <div>
              <h2>Calendar</h2>
              <p>Dec, 2022</p>
            </div>
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
          </header>

          <div className="doctor-calendar-days">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, idx) => (
              <span key={d} className={idx === 0 ? "is-active" : ""}>
                {idx + 9}
              </span>
            ))}
          </div>

          <div className="doctor-timeline">
            {timeGrid.map((time) => {
              const row = scheduleRows.find((entry) => entry.time === time);
              return (
                <div key={time} className="doctor-timeline-row">
                  <span>{time}</span>
                  <div className="doctor-timeline-slot">
                    {row ? (
                      <div className={`doctor-timeline-pill ${row.color}`} style={{ gridColumn: `span ${row.span}` }}>
                        {row.label}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>
      {error ? <p className="lab-login-note">{error}</p> : null}
    </div>
  );
}
