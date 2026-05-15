import { useMemo, useState } from "react";
import {
  Ban,
  Bookmark,
  CalendarDays,
  Check,
  Clock3,
  LocateFixed,
  Save,
  Search,
  Trash2,
  UserRound,
  X
} from "lucide-react";
import { WeekStrip } from "@/modules/frontdesk/components/WeekStrip";
import { formatDayForPill, formatMonthShort } from "@/modules/frontdesk/utils/week";

type LabModal = "none" | "datepicker" | "selectPatient" | "collectionDetails" | "rescheduleForm" | "cancellation";

type SlotStatus = "free" | "booked" | "inProgress" | "done" | "blocked";

type PhleboRow = {
  id: string;
  name: string;
  title: string;
};

const phlebotomists: PhleboRow[] = [
  { id: "p1", name: "Phlebo. Meera Chopra", title: "Senior Phlebotomist" }
];

const halfHourSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00"
];

const bookedMap: Record<string, { label: string; status: SlotStatus }> = {
  "p1-08:00": { label: "Anil", status: "done" },
  "p1-10:00": { label: "Chulbul", status: "booked" }
};

function slotButtonClass(status: SlotStatus): string {
  if (status === "done") return "slot-chip done";
  if (status === "booked") return "slot-chip booked";
  if (status === "inProgress") return "slot-chip in-progress";
  if (status === "blocked") return "slot-chip blocked";
  return "slot-box";
}

export function LabCollectionSlotsPage() {
  const [activeModal, setActiveModal] = useState<LabModal>("none");
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => new Date(2021, 1, 9));
  const [pickerMonth, setPickerMonth] = useState(() => new Date(2022, 1, 1));
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

  const syncLabelFromDay = (d: Date) => setDateLabel(formatDayForPill(d));

  return (
    <div className="screen-wrap calendar-screen lab-collection-screen">
      <h1 className="collection-page-title">Collection Slots Calendar</h1>

      <div className="collection-calendar-top">
        <WeekStrip selected={selectedDay} onSelect={(d) => setSelectedDay(d)} />
        <div className="datepicker-anchor">
          <button type="button" className="date-pill date-pill-field" onClick={() => setActiveModal("datepicker")}>
            <CalendarDays size={15} strokeWidth={2} />
            {dateLabel}
          </button>

          {activeModal === "datepicker" && (
            <>
              <button
                type="button"
                className="datepicker-dismiss-layer"
                aria-label="Dismiss calendar"
                onClick={() => setActiveModal("none")}
              />
              <div className="datepicker-popover" role="dialog" aria-label="Choose date">
                <DatePickerBody
                  month={pickerMonth}
                  onPrevMonth={() => setPickerMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                  onNextMonth={() => setPickerMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                  onPickDay={(picked) => {
                    setSelectedDay(picked);
                    setPickerMonth(new Date(picked.getFullYear(), picked.getMonth(), 1));
                    syncLabelFromDay(picked);
                    setActiveModal("none");
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <section className="calendar-panel lab-slot-panel">
        <div className="calendar-head lab-slot-head">
          <div className="doctor-cell phlebo-corner">
            <span>PHLEBO</span>
          </div>
          {halfHourSlots.map((slot) => (
            <div key={slot} className="time-cell">
              {slot}
            </div>
          ))}
        </div>

        {phlebotomists.map((row) => (
          <div key={row.id} className="calendar-row lab-slot-row">
            <div className="doctor-cell">
              <strong>{row.name}</strong>
              <span>{row.title}</span>
            </div>
            {halfHourSlots.map((slot) => {
              const key = `${row.id}-${slot}`;
              const booked = bookedMap[key];

              if (booked) {
                return (
                  <button
                    type="button"
                    key={key}
                    className={slotButtonClass(booked.status)}
                    onClick={() => setActiveModal("collectionDetails")}
                  >
                    {booked.status === "done" && <Check size={13} strokeWidth={2.8} className="slot-chip-icon" />}
                    {booked.status === "booked" && <Clock3 size={13} strokeWidth={2.2} className="slot-chip-icon" />}
                    {booked.status === "inProgress" && <Clock3 size={13} strokeWidth={2.2} className="slot-chip-icon" />}
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
                  aria-label={`Book ${row.name} ${slot}`}
                />
              );
            })}
          </div>
        ))}

        <div className="calendar-footer lab-slot-footer">
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
            onClick={() => setRescheduleMode((v) => !v)}
          >
            <Save size={17} strokeWidth={2} />
            {rescheduleMode ? "Save Changes" : "Select & Reschedule"}
          </button>
        </div>
      </section>

      {activeModal !== "none" && activeModal !== "datepicker" && (
        <div className="screen-overlay" onClick={() => setActiveModal("none")}>
          <div className="modal-card lab-modal-shell" onClick={(e) => e.stopPropagation()}>
            {activeModal === "selectPatient" && (
              <LabPatientForm
                title="Select Patient"
                titleIcon="user"
                ctaLabel="Confirm Appointment"
                includeAddress
                onClose={() => setActiveModal("none")}
                onSubmit={() => setActiveModal("collectionDetails")}
              />
            )}

            {activeModal === "rescheduleForm" && (
              <LabPatientForm
                title="Rescheduling"
                titleIcon="userClock"
                ctaLabel="Confirm & Reschedule"
                includeAddress
                onClose={() => setActiveModal("none")}
                onSubmit={() => {
                  setRescheduleMode(false);
                  setActiveModal("collectionDetails");
                }}
              />
            )}

            {activeModal === "collectionDetails" && (
              <LabCollectionDetails
                onClose={() => setActiveModal("none")}
                onReschedule={() => setActiveModal("rescheduleForm")}
                onDelete={() => setActiveModal("cancellation")}
              />
            )}

            {activeModal === "cancellation" && (
              <LabCancellationModal
                onClose={() => setActiveModal("none")}
                onConfirmCancel={() => setActiveModal("none")}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type DatePickerBodyProps = {
  month: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPickDay: (d: Date) => void;
};

function DatePickerBody({ month, onPrevMonth, onNextMonth, onPickDay }: DatePickerBodyProps) {
  const year = month.getFullYear();
  const mon = month.getMonth();
  const firstDow = new Date(year, mon, 1).getDay();
  const mondayBased = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < mondayBased; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);

  const label = `${formatMonthShort(month)} ${year}`;

  return (
    <div className="modal-content datepicker-card datepicker-popover-card">
      <h3>
        {label}
        <span className="month-nav-btns">
          <button type="button" className="month-chev" onClick={onPrevMonth} aria-label="Previous month">
            ‹
          </button>
          <button type="button" className="month-chev" onClick={onNextMonth} aria-label="Next month">
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
            <button
              type="button"
              key={`${mon}-${index}-${d}`}
              className="month-cell"
              onClick={() => onPickDay(new Date(year, mon, d))}
            >
              {d}
            </button>
          )
        )}
      </div>
    </div>
  );
}

type LabPatientFormProps = {
  title: string;
  titleIcon: "user" | "userClock";
  ctaLabel: string;
  includeAddress?: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

function LabPatientForm({ title, titleIcon, ctaLabel, includeAddress, onClose, onSubmit }: LabPatientFormProps) {
  return (
    <div className="modal-content patient-form lab-patient-form">
      <button type="button" className="close-modal icon-btn" onClick={onClose} aria-label="Close">
        <X size={16} />
      </button>
      <h3 className="modal-title with-icon lab-form-title">
        {titleIcon === "userClock" ? (
          <span className="lab-title-icons" aria-hidden>
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
          <PhoneGlyph />
          <input type="tel" autoComplete="off" name="patient-phone" placeholder="+91 12345 12345" />
        </div>
        <input className="popup-field patient-cell-input" autoComplete="off" placeholder="e.g. 23 years" />
      </div>
      <div className="form-row-labels">
        <label className="field-label">DOB</label>
        <label className="field-label">GENDER</label>
      </div>
      <div className="form-row">
        <div className="patient-field input-with-icon">
          <CalendarDays size={14} strokeWidth={2} />
          <input autoComplete="off" placeholder="DD/MM/YYYY" />
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
          <div className="patient-textarea-wrap lab-address-block">
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
      ) : null}
      <button type="button" className="pill-btn dark pill-btn-navy full lab-cta-btn" onClick={onSubmit}>
        <Check size={18} strokeWidth={2.4} />
        {ctaLabel}
      </button>
    </div>
  );
}

function PhoneGlyph() {
  return <span className="phone-dot" aria-hidden />;
}

function LabCollectionDetails({
  onClose,
  onReschedule,
  onDelete
}: {
  onClose: () => void;
  onReschedule: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="modal-content lab-collection-detail-card">
      <button type="button" className="close-modal icon-btn" onClick={onClose} aria-label="Close">
        <X size={16} />
      </button>
      <h2 className="lab-detail-heading">Collection Details</h2>

      <div className="lab-patient-hero">
        <div className="lab-patient-avatar" aria-hidden>
          <span className="lab-patient-avatar-initials">SJ</span>
        </div>
        <div className="lab-patient-hero-text">
          <span className="lab-patient-kicker">PATIENT</span>
          <span className="lab-patient-name">Sarah Jenkins</span>
        </div>
      </div>

      <ul className="lab-detail-facts">
        <li>
          <Bookmark size={15} strokeWidth={2} />
          <span>
            LAB TEST ID: <strong>LT-231-2211</strong>
          </span>
        </li>
        <li>
          <CalendarDays size={15} strokeWidth={2} />
          <span>Tuesday, Oct 24, 2023</span>
        </li>
        <li>
          <Clock3 size={15} strokeWidth={2} />
          <span>08:00 AM</span>
        </li>
      </ul>

      <div className="lab-detail-actions">
        <button type="button" className="pill-btn light lab-reschedule-wide" onClick={onReschedule}>
          <CalendarDays size={16} strokeWidth={2} />
          Reschedule
        </button>
        <button type="button" className="lab-delete-btn" onClick={onDelete} aria-label="Delete collection">
          <Trash2 size={17} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function LabCancellationModal({
  onClose,
  onConfirmCancel
}: {
  onClose: () => void;
  onConfirmCancel: () => void;
}) {
  return (
    <div className="modal-content lab-collection-detail-card lab-cancel-card">
      <button type="button" className="close-modal icon-btn" onClick={onClose} aria-label="Close">
        <X size={16} />
      </button>
      <h2 className="lab-detail-heading lab-cancel-title">Cancellation</h2>

      <div className="lab-patient-hero">
        <div className="lab-patient-avatar" aria-hidden>
          <span className="lab-patient-avatar-initials">SJ</span>
        </div>
        <div className="lab-patient-hero-text">
          <span className="lab-patient-kicker">PATIENT</span>
          <span className="lab-patient-name">Sarah Jenkins</span>
        </div>
      </div>

      <ul className="lab-detail-facts">
        <li>
          <Bookmark size={15} strokeWidth={2} />
          <span>
            LAB TEST ID: <strong>LT-231-2211</strong>
          </span>
        </li>
        <li>
          <CalendarDays size={15} strokeWidth={2} />
          <span>Tuesday, Oct 24, 2023</span>
        </li>
        <li>
          <Clock3 size={15} strokeWidth={2} />
          <span>08:00 AM</span>
        </li>
      </ul>

      <div className="lab-cancel-actions">
        <button type="button" className="pill-btn light" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="pill-btn danger" onClick={onConfirmCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
