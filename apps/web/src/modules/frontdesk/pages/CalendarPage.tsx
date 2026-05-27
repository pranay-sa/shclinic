import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  X,
} from "lucide-react";
import { WeekStrip } from "@/modules/frontdesk/components/WeekStrip";
import { formatDayForPill, formatMonthShort } from "@/modules/frontdesk/utils/week";
import { apiRequest } from "@/core/http";

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
  full_name: string;
  username: string;
};

type AppointmentRow = {
  id: string;
  appointment_code: string;
  appointment_date: string;
  slot_time: string;
  visit_type: "new" | "follow_up";
  status: "booked" | "in_progress" | "done" | "cancelled";
  patient_id: string;
  patient_code: string;
  first_name: string;
  last_name: string;
  mobile: string;
  gender: string;
  date_of_birth: string;
  doctor_id: string | null;
  doctor_name: string | null;
};

type PatientSearchRow = {
  id: string;
  patient_code: string;
  first_name: string;
  last_name: string;
  mobile: string;
  gender: string;
  date_of_birth: string;
};

type AppointmentFormData = {
  patientId: string;
  patientName: string;
  phone: string;
  age: string;
  dob: string;
  gender: string;
  date: string;
  slot: string;
  address: string;
  visitType: "new" | "follow_up";
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

function slotClass(status: SlotStatus): string {
  if (status === "done") return "slot-chip done";
  if (status === "booked") return "slot-chip booked";
  if (status === "inProgress") return "slot-chip in-progress";
  if (status === "blocked") return "slot-chip blocked";
  return "slot-box";
}

function toApiDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromApiTime(time: string): string {
  return time.slice(0, 5);
}

function calculateAge(dateOfBirth: string): string {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.valueOf())) return "";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasBirthdayPassed) age -= 1;
  return String(Math.max(0, age));
}

function statusToSlotStatus(status: AppointmentRow["status"]): SlotStatus {
  if (status === "done") return "done";
  if (status === "in_progress") return "inProgress";
  if (status === "cancelled") return "blocked";
  return "booked";
}

export function CalendarPage() {
  const [activeModal, setActiveModal] = useState<CalendarModal>("none");
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [dateLabel, setDateLabel] = useState(formatDayForPill(new Date()));
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [activeSlotContext, setActiveSlotContext] = useState<{ doctorId: string; slot: string } | null>(null);
  const [activeAppointment, setActiveAppointment] = useState<AppointmentRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const legend = useMemo(
    () => [
      { label: "Free - click to book", kind: "free" as const },
      { label: "Booked", kind: "booked" as const },
      { label: "In progress", kind: "inProgress" as const },
      { label: "Done", kind: "done" as const },
      { label: "Blocked", kind: "blocked" as const },
    ],
    [],
  );

  const appointmentMap = useMemo(() => {
    const map = new Map<string, AppointmentRow>();
    appointments.forEach((appointment) => {
      const key = `${appointment.doctor_id ?? "none"}-${fromApiTime(appointment.slot_time)}`;
      map.set(key, appointment);
    });
    return map;
  }, [appointments]);

  async function loadCalendarData() {
    const date = toApiDate(selectedDay);
    try {
      setCalendarError(null);
      const [doctorRows, appointmentRows] = await Promise.all([
        apiRequest<DoctorRow[]>("/doctors"),
        apiRequest<AppointmentRow[]>(`/appointments?date=${date}`),
      ]);
      setDoctors(doctorRows);
      setAppointments(appointmentRows);
    } catch {
      setCalendarError("Unable to load calendar data. Please retry.");
    }
  }

  useEffect(() => {
    loadCalendarData();
  }, [selectedDay]);

  const selectedDate = toApiDate(selectedDay);

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
              <strong>{doctor.full_name}</strong>
              <span>{doctor.username}</span>
            </div>
            {slots.map((slot) => {
              const key = `${doctor.id}-${slot}`;
              const appointment = appointmentMap.get(key);

              if (appointment) {
                const status = statusToSlotStatus(appointment.status);
                return (
                  <button
                    type="button"
                    key={key}
                    className={slotClass(status)}
                    onClick={() => {
                      setActiveAppointment(appointment);
                      setActiveModal(appointment.status === "done" ? "paidView" : "appointmentDetails");
                    }}
                  >
                    {status === "done" && <Check size={13} strokeWidth={2.8} className="slot-chip-icon" />}
                    {status === "booked" && <Clock3 size={13} strokeWidth={2.2} className="slot-chip-icon" />}
                    {status === "inProgress" && <Clock3 size={13} strokeWidth={2.2} className="slot-chip-icon" />}
                    {status === "blocked" && <Ban size={13} strokeWidth={2.2} className="slot-chip-icon" />}
                    <span>{appointment.first_name}</span>
                  </button>
                );
              }

              return (
                <button
                  type="button"
                  key={key}
                  className="slot-box"
                  onClick={() => {
                    setActiveSlotContext({ doctorId: doctor.id, slot });
                    setActiveModal(rescheduleMode ? "rescheduleForm" : "selectPatient");
                  }}
                  aria-label={`Book ${doctor.full_name} ${slot}`}
                />
              );
            })}
          </div>
        ))}

        {calendarError ? <p className="patpage-sub">{calendarError}</p> : null}
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
                  {["Doctor", "Lab", "In-house", "Consulting"].map((item) => (
                    <label key={item} className="check-item">
                      <input type="checkbox" />
                      {item}
                    </label>
                  ))}
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

            {activeModal === "selectPatient" && activeSlotContext && (
              <PatientForm
                title="Select Patient"
                ctaLabel="Confirm Appointment"
                includeAddress
                selectedDate={selectedDate}
                selectedSlot={activeSlotContext.slot}
                onClose={() => setActiveModal("none")}
                onSubmit={async (formData) => {
                  setIsSaving(true);
                  try {
                    await apiRequest("/appointments", {
                      method: "POST",
                      body: {
                        patientId: formData.patientId,
                        doctorId: activeSlotContext.doctorId,
                        appointmentDate: formData.date,
                        slotTime: formData.slot,
                        visitType: formData.visitType,
                        notes: formData.address,
                      },
                    });
                    await loadCalendarData();
                    setActiveModal("none");
                  } finally {
                    setIsSaving(false);
                  }
                }}
                isSubmitting={isSaving}
              />
            )}

            {activeModal === "rescheduleForm" && activeAppointment && (
              <PatientForm
                title="Rescheduling"
                ctaLabel="Confirm & Reschedule"
                selectedDate={activeAppointment.appointment_date}
                selectedSlot={fromApiTime(activeAppointment.slot_time)}
                initialPatient={{
                  id: activeAppointment.patient_id,
                  name: `${activeAppointment.first_name} ${activeAppointment.last_name}`,
                  phone: activeAppointment.mobile,
                  dob: activeAppointment.date_of_birth,
                  gender: activeAppointment.gender,
                }}
                onClose={() => setActiveModal("none")}
                onSubmit={async (formData) => {
                  setIsSaving(true);
                  try {
                    await apiRequest(`/appointments/${activeAppointment.id}`, {
                      method: "PATCH",
                      body: {
                        appointmentDate: formData.date,
                        slotTime: formData.slot,
                        status: "booked",
                        visitType: formData.visitType,
                        notes: formData.address,
                      },
                    });
                    await loadCalendarData();
                    setRescheduleMode(false);
                    setActiveModal("appointmentDetails");
                  } finally {
                    setIsSaving(false);
                  }
                }}
                isSubmitting={isSaving}
              />
            )}

            {activeModal === "appointmentDetails" && activeAppointment && (
              <AppointmentCard
                title="Appointment Details"
                appointment={activeAppointment}
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

            {activeModal === "billingConfirm" && activeAppointment && (
              <AppointmentCard
                title="Billing confirmation"
                appointment={activeAppointment}
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

            {activeModal === "cancelConfirm" && activeAppointment && (
              <AppointmentCard
                title="Cancellation"
                appointment={activeAppointment}
                onClose={() => setActiveModal("none")}
                footer={
                  <>
                    <button type="button" className="pill-btn light" onClick={() => setActiveModal("none")}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="pill-btn danger"
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          await apiRequest(`/appointments/${activeAppointment.id}`, { method: "DELETE" });
                          await loadCalendarData();
                          setActiveModal("none");
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                    >
                      Cancel appointment
                    </button>
                  </>
                }
              />
            )}

            {activeModal === "paidView" && activeAppointment && (
              <AppointmentCard
                title="Appointment Details"
                appointment={activeAppointment}
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
  selectedDate: string;
  selectedSlot: string;
  initialPatient?: {
    id: string;
    name: string;
    phone: string;
    dob: string;
    gender: string;
  };
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  isSubmitting: boolean;
};

function PatientForm({
  title,
  ctaLabel,
  includeAddress,
  selectedDate,
  selectedSlot,
  initialPatient,
  onClose,
  onSubmit,
  isSubmitting,
}: PatientFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PatientSearchRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: initialPatient?.id ?? "",
    patientName: initialPatient?.name ?? "",
    phone: initialPatient?.phone ?? "",
    age: initialPatient?.dob ? calculateAge(initialPatient.dob) : "",
    dob: initialPatient?.dob ?? "",
    gender: initialPatient?.gender ?? "",
    date: selectedDate,
    slot: selectedSlot,
    address: "",
    visitType: "follow_up",
  });

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const resp = await apiRequest<{ items: PatientSearchRow[] }>(
          `/patients?search=${encodeURIComponent(searchTerm.trim())}&page=1&pageSize=5`,
        );
        setSearchResults(resp.items);
      } catch {
        setSearchResults([]);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  return (
    <form
      className="modal-content patient-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        if (!formData.patientId) {
          setError("Select a patient from search before confirming appointment.");
          return;
        }
        if (!formData.patientName || !formData.phone || !formData.age || !formData.dob || !formData.gender) {
          setError("All details are compulsory to confirm appointment.");
          return;
        }
        await onSubmit(formData);
      }}
    >
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
        <input
          autoComplete="off"
          placeholder="Search Patient"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {searchResults.length > 0 ? (
        <div className="lab-reports-list">
          {searchResults.map((patient) => (
            <button
              type="button"
              key={patient.id}
              className="patpage-view"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  patientId: patient.id,
                  patientName: `${patient.first_name} ${patient.last_name}`,
                  phone: patient.mobile,
                  gender: patient.gender,
                  dob: patient.date_of_birth,
                  age: calculateAge(patient.date_of_birth),
                }))
              }
            >
              {patient.patient_code} - {patient.first_name} {patient.last_name}
            </button>
          ))}
        </div>
      ) : null}
      <label className="field-label">FULL PATIENT NAME</label>
      <div className="patient-field input-with-icon">
        <UserRound size={14} strokeWidth={2} />
        <input
          autoComplete="off"
          required
          value={formData.patientName}
          onChange={(e) => setFormData((prev) => ({ ...prev, patientName: e.target.value }))}
        />
      </div>
      <div className="form-row-labels">
        <label className="field-label">PHONE NUMBER</label>
        <label className="field-label">AGE</label>
      </div>
      <div className="form-row">
        <div className="patient-field input-with-icon">
          <PhoneIcon />
          <input
            type="tel"
            autoComplete="off"
            required
            minLength={8}
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        <input
          className="popup-field patient-cell-input"
          autoComplete="off"
          required
          inputMode="numeric"
          pattern="[0-9]+"
          value={formData.age}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              age: e.target.value.replace(/\D/g, ""),
            }))
          }
        />
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
            required
            type={includeAddress ? "date" : "text"}
            value={includeAddress ? formData.dob : formData.visitType}
            onChange={(e) =>
              setFormData((prev) =>
                includeAddress
                  ? { ...prev, dob: e.target.value, age: calculateAge(e.target.value) }
                  : { ...prev, visitType: e.target.value === "new" ? "new" : "follow_up" },
              )
            }
          />
        </div>
        <select
          className="popup-field patient-cell-input"
          value={formData.gender}
          required
          aria-label="Gender"
          onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
        >
          <option value="" disabled>
            Select gender
          </option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-row-labels">
        <label className="field-label">DATE</label>
        <label className="field-label">SLOT</label>
      </div>
      <div className="form-row">
        <div className="patient-field input-with-icon">
          <CalendarDays size={14} strokeWidth={2} />
          <input
            autoComplete="off"
            required
            type="date"
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
          />
        </div>
        <div className="patient-field input-with-icon">
          <Clock3 size={14} strokeWidth={2} />
          <input
            autoComplete="off"
            required
            value={formData.slot}
            onChange={(e) => setFormData((prev) => ({ ...prev, slot: e.target.value }))}
          />
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
              required
              autoComplete="off"
              placeholder="Street, area, city, PIN"
              spellCheck={false}
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>
        </>
      ) : (
        <>
          <label className="field-label">DOCTOR</label>
          <input className="popup-field patient-full-width" autoComplete="off" required placeholder="Doctor name" />
        </>
      )}
      {error ? <p className="patpage-sub">{error}</p> : null}
      <button type="submit" className="pill-btn dark pill-btn-navy full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : ctaLabel}
      </button>
    </form>
  );
}

type AppointmentCardProps = {
  title: string;
  appointment: AppointmentRow;
  onClose: () => void;
  footer: ReactNode;
};

function AppointmentCard({ title, appointment, onClose, footer }: AppointmentCardProps) {
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
          <strong>
            {appointment.first_name} {appointment.last_name}
          </strong>
        </div>
        <div>
          <UserRound size={14} />
          <small>DOCTOR</small>
          <strong>{appointment.doctor_name ?? "Unassigned"}</strong>
        </div>
      </div>
      <ul className="details-list">
        <li>
          <IdCard size={14} />
          APT ID: {appointment.appointment_code}
        </li>
        <li>
          <CalendarDays size={14} />
          {appointment.appointment_date}
        </li>
        <li>
          <Circle size={10} />
          {appointment.visit_type}
        </li>
      </ul>
      <div className="modal-actions">{footer}</div>
    </div>
  );
}

function CalendarDatePickerModal({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (d: Date) => void;
}) {
  const [pickerMonth, setPickerMonth] = useState(() => new Date());
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
            <button
              type="button"
              key={`${mon}-${index}-${d}`}
              className="month-cell"
              onClick={() => onPick(new Date(year, mon, d))}
            >
              {d}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function PhoneIcon() {
  return <span className="phone-dot" aria-hidden />;
}
