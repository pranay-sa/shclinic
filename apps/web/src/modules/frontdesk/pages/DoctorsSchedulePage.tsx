import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  Phone,
  Plus,
  Search,
  X
} from "lucide-react";
import { apiRequest } from "@/core/http";

type DayDot = "today" | "ooo" | "booked" | null;

type ApiDoctor = {
  id: string;
  full_name: string;
  username: string;
};

type WorkingRow = {
  id: string;
  day: string;
  start: string;
  end: string;
};

type OooEntry = {
  id: string;
  fromDate: string;
  toDate: string;
  fromTime: string;
  toTime: string;
  fullDay: boolean;
  createdAt: string;
};

type DoctorPageState = {
  rows: WorkingRow[];
  oooEntries: OooEntry[];
};

const defaultWorkingRows: WorkingRow[] = [
  { id: "w1", day: "MON", start: "09:00", end: "11:00" },
  { id: "w2", day: "MON", start: "14:00", end: "17:00" },
  { id: "w3", day: "TUE", start: "10:00", end: "13:00" },
  { id: "w4", day: "WED", start: "09:00", end: "12:00" },
  { id: "w5", day: "FRI", start: "08:30", end: "12:30" }
];

const dayOptions = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function buildMonthGrid(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month, 1).getDay();
  const dim = daysInMonth(year, month);
  const weeks: (number | null)[][] = [];
  let cur: (number | null)[] = [];
  for (let i = 0; i < first; i++) cur.push(null);
  for (let d = 1; d <= dim; d++) {
    cur.push(d);
    if (cur.length === 7) {
      weeks.push(cur);
      cur = [];
    }
  }
  if (cur.length) {
    while (cur.length < 7) cur.push(null);
    weeks.push(cur);
  }
  return weeks;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dotForDay(d: number | null, year: number, month: number, oooEntries: OooEntry[]): DayDot {
  if (d == null) return null;
  const current = new Date(year, month, d);
  const today = new Date();
  if (sameDay(current, today)) return "today";
  const isOutOfOffice = oooEntries.some((entry) => {
    const from = new Date(`${entry.fromDate}T00:00:00`);
    const to = new Date(`${entry.toDate}T23:59:59`);
    return current >= from && current <= to;
  });
  if (isOutOfOffice) return "ooo";
  if (current.getDay() === 1 || current.getDay() === 5) return "booked";
  return null;
}

export function DoctorsSchedulePage() {
  const [calYear, setCalYear] = useState(2023);
  const [calMonth, setCalMonth] = useState(9); // October 0-indexed
  const [oooOpen, setOooOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [doctorStates, setDoctorStates] = useState<Record<string, DoctorPageState>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [oooForm, setOooForm] = useState({
    fromDate: "",
    toDate: "",
    fromTime: "09:00",
    toTime: "17:00",
    fromFullDay: false,
    toFullDay: false
  });

  useEffect(() => {
    apiRequest<ApiDoctor[]>("/doctors")
      .then((resp) => {
        setDoctors(resp);
        setSelectedDoctorId((prev) => prev ?? resp[0]?.id ?? null);
        setDoctorStates((prev) => {
          const next = { ...prev };
          resp.forEach((doctor) => {
            if (!next[doctor.id]) {
              next[doctor.id] = {
                rows: defaultWorkingRows.map((row) => ({ ...row, id: `${doctor.id}-${row.id}` })),
                oooEntries: []
              };
            }
          });
          return next;
        });
      })
      .catch(() => setLoadError("Unable to load doctors. Please refresh or sign in again."));
  }, []);

  const monthLabel = useMemo(() => {
    return new Date(calYear, calMonth, 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
  }, [calYear, calMonth]);

  const grid = useMemo(() => buildMonthGrid(calYear, calMonth), [calYear, calMonth]);
  const dow = ["su", "mo", "tu", "we", "th", "fr", "sa"];
  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === selectedDoctorId) ?? null,
    [doctors, selectedDoctorId]
  );

  const selectedState: DoctorPageState = useMemo(
    () =>
      selectedDoctorId && doctorStates[selectedDoctorId]
        ? doctorStates[selectedDoctorId]
        : { rows: defaultWorkingRows, oooEntries: [] },
    [doctorStates, selectedDoctorId]
  );

  const filteredSearch = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((doctor) => doctor.full_name.toLowerCase().includes(q) || doctor.username.toLowerCase().includes(q));
  }, [doctors, searchQ]);

  const doctorInitials = useMemo(() => {
    if (!selectedDoctor) return "NA";
    const tokens = selectedDoctor.full_name.replace("Dr.", "").trim().split(/\s+/);
    const first = tokens[0]?.charAt(0) ?? "";
    const second = tokens[1]?.charAt(0) ?? "";
    return `${first}${second}`.toUpperCase() || selectedDoctor.full_name.slice(0, 2).toUpperCase();
  }, [selectedDoctor]);

  const doctorEmail = selectedDoctor ? `${selectedDoctor.username}@clinic.in` : "-";
  const doctorPhone = selectedDoctor ? "+1 (555) 010-8821" : "-";

  const latestOooEntry = selectedState.oooEntries.at(-1) ?? null;
  const noteDate = latestOooEntry ? new Date(latestOooEntry.createdAt).toLocaleDateString("en-GB") : "-";
  const noteBody = latestOooEntry
    ? `Out of office from ${latestOooEntry.fromDate} ${latestOooEntry.fullDay ? "(full day)" : latestOooEntry.fromTime}
to ${latestOooEntry.toDate} ${latestOooEntry.fullDay ? "(full day)" : latestOooEntry.toTime}.`
    : "No out-of-office notes added yet.";

  function updateSelectedDoctorState(updater: (prev: DoctorPageState) => DoctorPageState) {
    if (!selectedDoctorId) return;
    setDoctorStates((prev) => {
      const current = prev[selectedDoctorId] ?? { rows: defaultWorkingRows, oooEntries: [] };
      return {
        ...prev,
        [selectedDoctorId]: updater(current)
      };
    });
  }

  function addWorkingRow(afterIndex?: number) {
    updateSelectedDoctorState((prev) => {
      const nextRows = [...prev.rows];
      const insertIndex = afterIndex == null ? nextRows.length : afterIndex + 1;
      nextRows.splice(insertIndex, 0, {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        day: "MON",
        start: "09:00",
        end: "17:00"
      });
      return { ...prev, rows: nextRows };
    });
    setSaveMessage(null);
  }

  function removeWorkingRow(rowId: string) {
    updateSelectedDoctorState((prev) => {
      if (prev.rows.length <= 1) return prev;
      return { ...prev, rows: prev.rows.filter((row) => row.id !== rowId) };
    });
    setSaveMessage(null);
  }

  function updateWorkingRow(rowId: string, patch: Partial<WorkingRow>) {
    updateSelectedDoctorState((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row))
    }));
    setSaveMessage(null);
  }

  function saveOutOfOffice() {
    if (!selectedDoctorId) return;
    if (!oooForm.fromDate || !oooForm.toDate) return;
    const fullDay = oooForm.fromFullDay || oooForm.toFullDay;
    updateSelectedDoctorState((prev) => ({
      ...prev,
      oooEntries: [
        ...prev.oooEntries,
        {
          id: `${Date.now()}`,
          fromDate: oooForm.fromDate,
          toDate: oooForm.toDate,
          fromTime: oooForm.fromTime,
          toTime: oooForm.toTime,
          fullDay,
          createdAt: new Date().toISOString()
        }
      ]
    }));
    setOooForm({
      fromDate: "",
      toDate: "",
      fromTime: "09:00",
      toTime: "17:00",
      fromFullDay: false,
      toFullDay: false
    });
    setOooOpen(false);
    setSaveMessage(null);
  }

  return (
    <div className="screen-wrap calendar-screen doc-pat-screen">
      <div className="docpage-search-wrap">
        <div className="docpage-search-inner">
          <Search size={18} strokeWidth={2} className="docpage-search-icon" aria-hidden />
          <input
            className="docpage-search-input"
            placeholder="Search Doctors or IDs..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            aria-expanded={searchOpen}
            aria-autocomplete="list"
          />
        </div>
        {searchOpen && (
          <div className="docpage-search-dropdown" role="listbox">
            {filteredSearch.map((doctor) => (
              <button
                key={doctor.id}
                type="button"
                className="docpage-search-item"
                onClick={() => {
                  setSearchQ(doctor.full_name);
                  setSelectedDoctorId(doctor.id);
                  setSearchOpen(false);
                }}
              >
                <span className="docpage-search-avatar" aria-hidden>
                  {doctor.full_name.replace("Dr. ", "").charAt(0)}
                </span>
                <span className="docpage-search-item-text">
                  <strong>{doctor.full_name}</strong>
                  <span>{doctor.username}</span>
                </span>
              </button>
            ))}
            {filteredSearch.length === 0 ? <p className="patpage-sub">No doctors found for this search.</p> : null}
          </div>
        )}
        {searchOpen && (
          <button type="button" className="docpage-search-dismiss" aria-label="Close search" onClick={() => setSearchOpen(false)} />
        )}
      </div>

      <div className="docpage-two-col">
        <div className="docpage-col docpage-col-left">
          <article className="docpage-card docpage-profile">
            <div className="docpage-profile-row">
              <div className="docpage-avatar" aria-hidden>
                <span className="docpage-avatar-initials">{doctorInitials}</span>
              </div>
              <div className="docpage-profile-main">
                <div className="docpage-name-row">
                  <h1 className="docpage-doctor-name">{selectedDoctor?.full_name ?? "No doctors available"}</h1>
                  <span className="docpage-badge-active">ACTIVE</span>
                </div>
                <p className="docpage-spec">{selectedDoctor?.username ?? "-"}</p>
                <div className="docpage-contact">
                  <span>
                    <Phone size={14} strokeWidth={2} /> {doctorPhone}
                  </span>
                  <span>
                    <Mail size={14} strokeWidth={2} /> {doctorEmail}
                  </span>
                </div>
              </div>
            </div>
            {loadError ? <p className="patpage-sub">{loadError}</p> : null}
          </article>

          <article className="docpage-card docpage-avail">
            <div className="docpage-avail-head">
              <h2 className="docpage-section-title">
                <CalendarDays size={18} strokeWidth={2} />
                Availability &amp; Exceptions
              </h2>
              <button type="button" className="docpage-btn-ooo" onClick={() => setOooOpen(true)}>
                + OOO
              </button>
            </div>
            <div className="docpage-legend">
              <span>
                <i className="docpage-legend-dot docpage-legend-today" /> Today
              </span>
              <span>
                <i className="docpage-legend-dot docpage-legend-ooo" /> OOO
              </span>
              <span>
                <i className="docpage-legend-dot docpage-legend-booked" /> Fully Booked
              </span>
            </div>

            <div className="docpage-mini-cal">
              <div className="docpage-mini-cal-top">
                <button
                  type="button"
                  className="docpage-cal-nav"
                  aria-label="Previous month"
                  onClick={() => {
                    const d = new Date(calYear, calMonth - 1, 1);
                    setCalYear(d.getFullYear());
                    setCalMonth(d.getMonth());
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="docpage-cal-title">{monthLabel}</span>
                <button
                  type="button"
                  className="docpage-cal-nav"
                  aria-label="Next month"
                  onClick={() => {
                    const d = new Date(calYear, calMonth + 1, 1);
                    setCalYear(d.getFullYear());
                    setCalMonth(d.getMonth());
                  }}
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  type="button"
                  className="docpage-today-pill"
                  onClick={() => {
                    const now = new Date();
                    setCalYear(now.getFullYear());
                    setCalMonth(now.getMonth());
                  }}
                >
                  Today
                </button>
              </div>
              <div className="docpage-mini-dow">
                {dow.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="docpage-mini-grid">
                {grid.map((week, wi) =>
                  week.map((cell, di) => {
                    const dot = dotForDay(cell, calYear, calMonth, selectedState.oooEntries);
                    const key = `${wi}-${di}`;
                    if (cell == null) return <div key={key} className="docpage-mini-cell docpage-mini-empty" />;
                    return (
                      <div
                        key={key}
                        className={`docpage-mini-cell${dot === "today" ? " docpage-mini-today" : ""}${dot === "ooo" ? " docpage-mini-ooo" : ""}`}
                      >
                        <span className="docpage-mini-num">{cell}</span>
                        {dot === "booked" && <span className="docpage-mini-pink" />}
                        {dot === "ooo" && <span className="docpage-mini-dot-ooo" />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </article>

          <article className="docpage-card docpage-notes">
            <h3 className="docpage-notes-title">Notes on availability</h3>
            <div className="docpage-notes-meta">
              <div>
                <span className="docpage-notes-k">NOTE ID</span>
                  <span className="docpage-notes-v">{latestOooEntry?.id ?? "-"}</span>
              </div>
              <div>
                <span className="docpage-notes-k">DATE</span>
                  <span className="docpage-notes-v">{noteDate}</span>
              </div>
            </div>
            <p className="docpage-notes-body">{noteBody}</p>
          </article>
        </div>

        <div className="docpage-col docpage-col-right">
          <article className="docpage-card docpage-schedule-card">
            <div className="docpage-schedule-head">
              <h2 className="docpage-section-title docpage-schedule-title">Schedule Working Hours</h2>
              <button type="button" className="docpage-icon-add" aria-label="Add hours" onClick={() => addWorkingRow()}>
                <Plus size={20} strokeWidth={2.5} />
              </button>
            </div>
            <p className="docpage-subhead">
              <CalendarDays size={15} strokeWidth={2} />
              General daily availability
            </p>
            <ul className="docpage-slot-list">
              {selectedState.rows.map((r, rowIndex) => (
                <li key={r.id} className="docpage-slot-row">
                  <select
                    className="docpage-slot-day"
                    value={r.day}
                    onChange={(event) => updateWorkingRow(r.id, { day: event.target.value })}
                  >
                    {dayOptions.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <div className="docpage-slot-times">
                    <div className="docpage-time-field">
                      <Clock3 size={14} className="docpage-time-ico" aria-hidden />
                      <input type="time" value={r.start} onChange={(event) => updateWorkingRow(r.id, { start: event.target.value })} />
                    </div>
                    <ArrowRight size={16} className="docpage-slot-arrow" aria-hidden />
                    <div className="docpage-time-field">
                      <Clock3 size={14} className="docpage-time-ico" aria-hidden />
                      <input type="time" value={r.end} onChange={(event) => updateWorkingRow(r.id, { end: event.target.value })} />
                    </div>
                  </div>
                  <div className="docpage-slot-actions">
                    <button type="button" className="docpage-slot-icon" aria-label="Remove" onClick={() => removeWorkingRow(r.id)}>
                      <X size={16} strokeWidth={2} />
                    </button>
                    <button type="button" className="docpage-slot-icon" aria-label="Add" onClick={() => addWorkingRow(rowIndex)}>
                      <Plus size={16} strokeWidth={2} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="docpage-footer-actions">
              <button
                type="button"
                className="pill-btn dark pill-btn-navy docpage-save"
                onClick={() => setSaveMessage("Schedule changes saved locally for this session.")}
              >
                <Check size={18} strokeWidth={2.4} />
                Save Changes
              </button>
            </div>
            {saveMessage ? <p className="patpage-sub">{saveMessage}</p> : null}
          </article>
        </div>
      </div>

      {oooOpen && (
        <div className="screen-overlay" onClick={() => setOooOpen(false)}>
          <div className="modal-card docpage-ooo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content docpage-ooo-inner">
              <h3 className="docpage-ooo-title">Out of office</h3>
              <div className="docpage-ooo-row">
                <span className="docpage-ooo-label">FROM</span>
                <div className="docpage-ooo-fields">
                  <div className="docpage-time-field docpage-ooo-input">
                    <CalendarDays size={14} />
                    <input
                      type="date"
                      value={oooForm.fromDate}
                      onChange={(event) => setOooForm((prev) => ({ ...prev, fromDate: event.target.value }))}
                    />
                  </div>
                  <div className="docpage-time-field docpage-ooo-input">
                    <Clock3 size={14} />
                    <input
                      type="time"
                      value={oooForm.fromTime}
                      onChange={(event) => setOooForm((prev) => ({ ...prev, fromTime: event.target.value }))}
                      disabled={oooForm.fromFullDay}
                    />
                  </div>
                  <label className="docpage-ooo-check">
                    <input
                      type="checkbox"
                      checked={oooForm.fromFullDay}
                      onChange={(event) => setOooForm((prev) => ({ ...prev, fromFullDay: event.target.checked }))}
                    />{" "}
                    Full day
                  </label>
                </div>
              </div>
              <div className="docpage-ooo-row">
                <span className="docpage-ooo-label">TO</span>
                <div className="docpage-ooo-fields">
                  <div className="docpage-time-field docpage-ooo-input">
                    <CalendarDays size={14} />
                    <input
                      type="date"
                      value={oooForm.toDate}
                      onChange={(event) => setOooForm((prev) => ({ ...prev, toDate: event.target.value }))}
                    />
                  </div>
                  <div className="docpage-time-field docpage-ooo-input">
                    <Clock3 size={14} />
                    <input
                      type="time"
                      value={oooForm.toTime}
                      onChange={(event) => setOooForm((prev) => ({ ...prev, toTime: event.target.value }))}
                      disabled={oooForm.toFullDay}
                    />
                  </div>
                  <label className="docpage-ooo-check">
                    <input
                      type="checkbox"
                      checked={oooForm.toFullDay}
                      onChange={(event) => setOooForm((prev) => ({ ...prev, toFullDay: event.target.checked }))}
                    />{" "}
                    Full day
                  </label>
                </div>
              </div>
              <div className="docpage-ooo-actions">
                <button type="button" className="docpage-ooo-x" onClick={() => setOooOpen(false)} aria-label="Cancel">
                  <X size={18} />
                </button>
                <button type="button" className="pill-btn dark pill-btn-navy" onClick={saveOutOfOffice}>
                  <Check size={17} strokeWidth={2.4} />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
