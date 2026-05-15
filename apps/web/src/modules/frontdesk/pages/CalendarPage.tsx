import { useMemo, useState, type ReactNode } from "react";
import {
  Ban,
  CalendarDays,
  Check,
  ChevronDown,
  Circle,
  Clock3,
  Filter,
  IdCard,
  LocateFixed,
  Save,
  Search,
  Trash2,
  UserRound,
  X
} from "lucide-react";
import { WeekStrip } from "@/modules/frontdesk/components/WeekStrip";
import { formatDayForPill, formatMonthShort } from "@/modules/frontdesk/utils/week";

type CalendarModal =
  | "none"
  | "filters"
  | "datepicker"
  | "selectPatient"
  | "appointmentDetails"
  | "rescheduleForm"
  | "billingConfirm"
  | "cancelConfirm"
  | "paidView";

type SlotStatus = "free" | "booked" | "inProgress" | "done" | "blocked";

type DoctorRow = {
  id: string;
  name: string;
  speciality: string;
};

const doctors: DoctorRow[] = [
  { id: "d1", name: "Dr. Meera Chopra", speciality: "Endocrinology" },
  { id: "d2", name: "Dr. Arjun Rao", speciality: "Cardiology" },
  { id: "d3", name: "Dr. Shalini Menon", speciality: "General Medicine" },
  { id: "d4", name: "Dr. Asha Menon", speciality: "Ophthalmology" },
  { id: "d5", name: "Dr. Rajesh Khanna", speciality: "Pediatrics" },
  { id: "d6", name: "Dr. Sunita Williams", speciality: "Neurology" },
  { id: "d7", name: "Dr. Vikram Seth", speciality: "Orthopedics" },
  { id: "d8", name: "Dr. Neha Sharma", speciality: "Dermatology" }
];

const slots = ["09:00", "09:10", "09:20", "09:30", "09:40", "09:50", "10:00", "10:10", "10:20"];

const bookedMap: Record<string, { label: string; status: SlotStatus }> = {
  "d1-09:00": { label: "Anil", status: "done" },
  "d1-10:10": { label: "Chulbul", status: "booked" },
  "d6-09:20": { label: "Riya", status: "inProgress" },
  "d7-09:50": { label: "Riya", status: "blocked" }
};

function slotClass(status: SlotStatus): string {
  if (status === "done") return "slot-chip done";
  if (status === "booked") return "slot-chip booked";
  if (status === "inProgress") return "slot-chip in-progress";
  if (status === "blocked") return "slot-chip blocked";
  return "slot-box";
}

export function CalendarPage() {
  const [activeModal, setActiveModal] = useState<CalendarModal>("none");
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => new Date(2021, 1, 9));
  const [dateLabel, setDateLabel] = useState("09 Feb 2021");

  const legend = useMemo(
    () => [
      { label: "Free - click to book", kind: "free" as const },
      { label: "Booked", kind: "booked" as const },
      { label: "In progress", kind: "inProgress" as const },
      { label: "Done", kind: "done" as const },
      { label: "Blocked", kind: "blocked" as const }
    ],
    []
  );

  return (
    <div className="screen-wrap calendar-screen">
      <h1 className="collection-page-title">Appointment Calendar</h1>

      <div className="collection-calendar-top">
        <WeekStrip
          selected={selectedDay}
          onSelect={(d) => {
            setSelectedDay(d);
            setDateLabel(formatDayForPill(d));
          }}
        />
        <button type="button" className="date-pill date-pill-field" onClick={() => setActiveModal("datepicker")}>
          <CalendarDays size={15} strokeWidth={2} />
          {dateLabel}
        </button>
      </div>

      <div className="calendar-view-pill-row">
        <button type="button" className="pill-btn dark pill-btn-navy">
          All Doctor View
        </button>
      </div>

      <section className="calendar-panel">
        <div className="calendar-head">
          <div className="doctor-cell">
            <span>DOCTOR</span>
            <button type="button" className="ghost-icon-btn" onClick={() => setActiveModal("filters")}>
              <Filter size={12} />
            </button>
          </div>
          {slots.map((slot) => (
            <div key={slot} className="time-cell">
              {slot}
            </div>
          ))}
        </div>

        {doctors.map((doctor) => (
          <div key={doctor.id} className="calendar-row">
            <div className="doctor-cell">
              <strong>{doctor.name}</strong>
              <span>{doctor.speciality}</span>
            </div>
            {slots.map((slot) => {
              const key = `${doctor.id}-${slot}`;
              const booked = bookedMap[key];

              if (booked) {
                return (
                  <button
                    type="button"
                    key={key}
                    className={slotClass(booked.status)}
                    onClick={() =>
                      setActiveModal(booked.status === "done" ? "paidView" : "appointmentDetails")
                    }
                  >
                    {booked.status === "done" && <Check size={13} strokeWidth={2.8} className="slot-chip-icon" />}
                    {booked.status === "booked" && <Clock3 size={13} strokeWidth={2.2} className="slot-chip-icon" />}
                    {booked.status === "inProgress" && (
                      <Clock3 size={13} strokeWidth={2.2} className="slot-chip-icon" />
                    )}
                    {booked.status === "blocked" && <Ban size={13} strokeWidth={2.2} className="slot-chip-icon" />}
                    <span>{booked.label}</span>
                  </button>
                );
              }

              return (
                <button
                  type="button"
                  key={key}
                  className="slot-box"
                  onClick={() => setActiveModal(rescheduleMode ? "rescheduleForm" : "selectPatient")}
                  aria-label={`Book ${doctor.name} ${slot}`}
                />
              );
            })}
          </div>
        ))}

        <div className="calendar-footer">
          <div className="legend-wrap lab-legend-wrap">
            {legend.map((item) => (
              <div key={item.label} className="legend-item">
                {item.kind === "free" && <span className="legend-sample legend-sample-free" />}
                {item.kind === "booked" && (
                  <span className="legend-sample legend-sample-booked" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                )}
                {item.kind === "inProgress" && <span className="legend-sample legend-sample-inprog" />}
                {item.kind === "done" && <span className="legend-sample legend-sample-done" />}
                {item.kind === "blocked" && <span className="legend-sample legend-sample-blocked" />}
                {item.label}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="pill-btn dark pill-btn-navy lab-save-btn"
            onClick={() => setRescheduleMode((value) => !value)}
          >
            <Save size={17} strokeWidth={2} />
            {rescheduleMode ? "Save Changes" : "Select & Reschedule"}
          </button>
        </div>
      </section>

      {activeModal !== "none" && (
        <div className="screen-overlay" onClick={() => setActiveModal("none")}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            {activeModal === "filters" && (
              <div className="modal-content">
                <h3>Doctor filters</h3>
                <div className="line-title">
                  Specializations
                  <ChevronDown size={14} />
                </div>
                <div className="checkbox-grid">
                  {["Option 1", "Option 2", "Option 3", "Option 4", "Option 1", "Option 2", "Option 3", "Option 4"].map(
                    (item) => (
                      <label key={item} className="check-item">
                        <input type="checkbox" />
                        {item}
                      </label>
                    )
                  )}
                </div>
                <div className="modal-actions">
                  <button type="button" className="pill-btn light" onClick={() => setActiveModal("none")}>
                    Reset
                  </button>
                  <button type="button" className="pill-btn dark" onClick={() => setActiveModal("none")}>
                    Apply
                  </button>
                </div>
              </div>
            )}

            {activeModal === "datepicker" && (
              <CalendarDatePickerModal
                onClose={() => setActiveModal("none")}
                onPick={(picked) => {
                  setSelectedDay(picked);
                  setDateLabel(formatDayForPill(picked));
                  setActiveModal("none");
                }}
              />
            )}

            {activeModal === "selectPatient" && (
              <PatientForm
                title="Select Patient"
                ctaLabel="Confirm Appointment"
                includeAddress
                onClose={() => setActiveModal("none")}
                onSubmit={() => setActiveModal("appointmentDetails")}
              />
            )}

            {activeModal === "rescheduleForm" && (
              <PatientForm
                title="Rescheduling"
                ctaLabel="Confirm & Reschedule"
                onClose={() => setActiveModal("none")}
                onSubmit={() => {
                  setRescheduleMode(false);
                  setActiveModal("appointmentDetails");
                }}
              />
            )}

            {activeModal === "appointmentDetails" && (
              <AppointmentCard
                title="Appointment Details"
                onClose={() => setActiveModal("none")}
                footer={
                  <>
                    <button type="button" className="danger-square" onClick={() => setActiveModal("cancelConfirm")}>
                      <Trash2 size={14} />
                    </button>
                    <button type="button" className="pill-btn light appt-reschedule" onClick={() => setActiveModal("rescheduleForm")}>
                      <CalendarDays size={16} strokeWidth={2} />
                      Reschedule
                    </button>
                    <button type="button" className="pill-btn light" onClick={() => setActiveModal("billingConfirm")}>
                      Go to Billing
                    </button>
                  </>
                }
              />
            )}

            {activeModal === "billingConfirm" && (
              <AppointmentCard
                title="Billing confirmation"
                onClose={() => setActiveModal("none")}
                footer={
                  <>
                    <button type="button" className="pill-btn light" onClick={() => setActiveModal("none")}>
                      Cancel
                    </button>
                    <button type="button" className="pill-btn dark" onClick={() => setActiveModal("paidView")}>
                      Go to billing
                    </button>
                  </>
                }
              />
            )}

            {activeModal === "cancelConfirm" && (
              <AppointmentCard
                title="Cancellation"
                onClose={() => setActiveModal("none")}
                footer={
                  <>
                    <button type="button" className="pill-btn light" onClick={() => setActiveModal("none")}>
                      Cancel
                    </button>
                    <button type="button" className="pill-btn danger" onClick={() => setActiveModal("none")}>
                      Cancel appointment
                    </button>
                  </>
                }
              />
            )}

            {activeModal === "paidView" && (
              <AppointmentCard
                title="Appointment Details"
                onClose={() => setActiveModal("none")}
                footer={
                  <span className="payment-chip" role="status">
                    Paid
                  </span>
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type PatientFormProps = {
  title: string;
  ctaLabel: string;
  includeAddress?: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

function PatientForm({ title, ctaLabel, includeAddress, onClose, onSubmit }: PatientFormProps) {
  return (
    <div className="modal-content patient-form">
      <button type="button" className="close-modal icon-btn" onClick={onClose} aria-label="close">
        <X size={16} />
      </button>
      <h3 className="modal-title with-icon">
        {title === "Rescheduling" ? (
          <span className="patient-title-icons" aria-hidden>
            <UserRound size={17} strokeWidth={2} />
            <Clock3 size={17} strokeWidth={2} />
          </span>
        ) : (
          <UserRound size={17} strokeWidth={2} />
        )}
        {title}
      </h3>
      <div className="patient-field input-with-icon">
        <Search size={15} strokeWidth={2} />
        <input autoComplete="off" placeholder="Search Patient" />
      </div>
      <label className="field-label">FULL PATIENT NAME</label>
      <div className="patient-field input-with-icon">
        <UserRound size={14} strokeWidth={2} />
        <input autoComplete="off" name="patient-full-name" placeholder="Full patient name" />
      </div>
      <div className="form-row-labels">
        <label className="field-label">PHONE NUMBER</label>
        <label className="field-label">AGE</label>
      </div>
      <div className="form-row">
        <div className="patient-field input-with-icon">
          <PhoneIcon />
          <input type="tel" autoComplete="off" name="patient-phone" placeholder="+91 12345 12345" />
        </div>
        <input className="popup-field patient-cell-input" autoComplete="off" placeholder="e.g. 23 years" />
      </div>
      <div className="form-row-labels">
        <label className="field-label">{includeAddress ? "DOB" : "TYPE OF VISIT"}</label>
        <label className="field-label">GENDER</label>
      </div>
      <div className="form-row">
        <div className="patient-field input-with-icon">
          <CalendarDays size={14} strokeWidth={2} />
          <input
            autoComplete="off"
            placeholder={includeAddress ? "DD/MM/YYYY" : "e.g. Follow-up / New"}
          />
        </div>
        <select className="popup-field patient-cell-input" defaultValue="" aria-label="Gender">
          <option value="" disabled>
            Select gender
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="form-row-labels">
        <label className="field-label">DATE</label>
        <label className="field-label">SLOT</label>
      </div>
      <div className="form-row">
        <div className="patient-field input-with-icon">
          <CalendarDays size={14} strokeWidth={2} />
          <input autoComplete="off" placeholder="DD/MM/YYYY" />
        </div>
        <div className="patient-field input-with-icon">
          <Clock3 size={14} strokeWidth={2} />
          <input autoComplete="off" placeholder="00:00" />
        </div>
      </div>
      {includeAddress ? (
        <>
          <label className="field-label">ADDRESS</label>
          <div className="patient-textarea-wrap">
            <LocateFixed size={15} className="patient-textarea-icon" aria-hidden />
            <textarea
              className="patient-textarea"
              rows={4}
              autoComplete="off"
              placeholder="Street, area, city, PIN"
              spellCheck={false}
            />
          </div>
        </>
      ) : (
        <>
          <label className="field-label">DOCTOR</label>
          <input className="popup-field patient-full-width" autoComplete="off" placeholder="Doctor name" />
        </>
      )}
      <button type="button" className="pill-btn dark pill-btn-navy full" onClick={onSubmit}>
        {ctaLabel}
      </button>
    </div>
  );
}

type AppointmentCardProps = {
  title: string;
  onClose: () => void;
  footer: ReactNode;
};

function AppointmentCard({ title, onClose, footer }: AppointmentCardProps) {
  return (
    <div className="modal-content appointment-card">
      <button type="button" className="close-modal icon-btn" onClick={onClose} aria-label="close">
        <X size={16} />
      </button>
      <p className="modal-subtitle">{title}</p>
      <div className="person-strip">
        <div>
          <UserRound size={14} />
          <small>PATIENT</small>
          <strong>Sarah Jenkins</strong>
        </div>
        <div>
          <UserRound size={14} />
          <small>DOCTOR</small>
          <strong>Dr. Michael Chen</strong>
        </div>
      </div>
      <ul className="details-list">
        <li>
          <IdCard size={14} />
          APT ID: APT-882941-X
        </li>
        <li>
          <CalendarDays size={14} />
          Friday, Oct 27, 2023
        </li>
        <li>
          <Circle size={10} />
          Follow-up
        </li>
      </ul>
      <div className="modal-actions">{footer}</div>
    </div>
  );
}

function CalendarDatePickerModal({
  onClose,
  onPick
}: {
  onClose: () => void;
  onPick: (d: Date) => void;
}) {
  const [pickerMonth, setPickerMonth] = useState(() => new Date(2022, 1, 1));
  const year = pickerMonth.getFullYear();
  const mon = pickerMonth.getMonth();
  const firstDow = new Date(year, mon, 1).getDay();
  const mondayBased = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < mondayBased; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);

  const label = `${formatMonthShort(pickerMonth)} ${year}`;

  return (
    <div className="modal-content datepicker-card">
      <button type="button" className="close-modal icon-btn" onClick={onClose} aria-label="Close">
        <X size={16} />
      </button>
      <h3>
        {label}
        <span className="month-nav-btns">
          <button
            type="button"
            className="month-chev"
            onClick={() => setPickerMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            type="button"
            className="month-chev"
            onClick={() => setPickerMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            ›
          </button>
        </span>
      </h3>
      <div className="week-grid">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="month-grid">
        {cells.map((d, index) =>
          d == null ? (
            <span key={`e-${index}`} className="month-cell month-cell-empty" />
          ) : (
            <button type="button" key={`${mon}-${index}-${d}`} className="month-cell" onClick={() => onPick(new Date(year, mon, d))}>
              {d}
            </button>
          )
        )}
      </div>
    </div>
  );
}

function PhoneIcon() {
  return <span className="phone-dot" aria-hidden />;
}
