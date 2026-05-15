import { useMemo, useState } from "react";
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

type DayDot = "today" | "ooo" | "booked" | null;

const workingRows = [
  { id: "w1", day: "mon", start: "09:00 AM", end: "11:00 AM" },
  { id: "w2", day: "mon", start: "02:00 PM", end: "05:00 PM" },
  { id: "w3", day: "TUE", start: "10:00 AM", end: "01:00 PM" },
  { id: "w4", day: "WED", start: "09:00 AM", end: "12:00 PM" },
  { id: "w5", day: "FRI", start: "08:30 AM", end: "12:30 PM" }
];

const searchResults = [
  { id: "d1", name: "Dr. Emily Rodriguez", spec: "Dermatology" },
  { id: "d2", name: "Dr. James Wilson", spec: "Neurology" },
  { id: "d3", name: "Dr. Olivia Brown", spec: "General Practice" },
  { id: "d4", name: "Dr. William Taylor", spec: "Orthopedics" },
  { id: "d5", name: "Dr. Sophia Martinez", spec: "Oncology" }
];

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

function dotForDay(d: number | null, year: number, month: number): DayDot {
  if (d == null) return null;
  if (year === 2023 && month === 9) {
    if (d === 9) return "today";
    if (d === 12 || d === 13) return "ooo";
    if (d === 15 || d === 22) return "booked";
  }
  return null;
}

export function DoctorsSchedulePage() {
  const [calYear, setCalYear] = useState(2023);
  const [calMonth, setCalMonth] = useState(9); // October 0-indexed
  const [oooOpen, setOooOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [rows] = useState(workingRows);

  const monthLabel = useMemo(() => {
    return new Date(calYear, calMonth, 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
  }, [calYear, calMonth]);

  const grid = useMemo(() => buildMonthGrid(calYear, calMonth), [calYear, calMonth]);
  const dow = ["su", "mo", "tu", "we", "th", "fr", "sa"];

  const filteredSearch = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return searchResults;
    return searchResults.filter((d) => d.name.toLowerCase().includes(q) || d.spec.toLowerCase().includes(q));
  }, [searchQ]);

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
            {filteredSearch.map((d) => (
              <button
                key={d.id}
                type="button"
                className="docpage-search-item"
                onClick={() => {
                  setSearchQ(d.name);
                  setSearchOpen(false);
                }}
              >
                <span className="docpage-search-avatar" aria-hidden>
                  {d.name.replace("Dr. ", "").charAt(0)}
                </span>
                <span className="docpage-search-item-text">
                  <strong>{d.name}</strong>
                  <span>{d.spec}</span>
                </span>
              </button>
            ))}
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
                <span className="docpage-avatar-initials">SJ</span>
              </div>
              <div className="docpage-profile-main">
                <div className="docpage-name-row">
                  <h1 className="docpage-doctor-name">Dr. Sarah Jenkins</h1>
                  <span className="docpage-badge-active">ACTIVE</span>
                </div>
                <p className="docpage-spec">Cardiologist</p>
                <div className="docpage-contact">
                  <span>
                    <Phone size={14} strokeWidth={2} /> +1 (555) 010-8821
                  </span>
                  <span>
                    <Mail size={14} strokeWidth={2} /> sarah.jenkins@clinic.in
                  </span>
                </div>
              </div>
            </div>
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
                <button type="button" className="docpage-today-pill">
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
                    const dot = dotForDay(cell, calYear, calMonth);
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
                <span className="docpage-notes-v">Dr-332224-1312-1</span>
              </div>
              <div>
                <span className="docpage-notes-k">DATE</span>
                <span className="docpage-notes-v">23-11-2025</span>
              </div>
            </div>
            <p className="docpage-notes-body">
              Attending Medical Conference in Boston on 23rd Jan, OOO for 22nd and 23rd Jan.
            </p>
          </article>
        </div>

        <div className="docpage-col docpage-col-right">
          <article className="docpage-card docpage-schedule-card">
            <div className="docpage-schedule-head">
              <h2 className="docpage-section-title docpage-schedule-title">Schedule Working Hours</h2>
              <button type="button" className="docpage-icon-add" aria-label="Add hours">
                <Plus size={20} strokeWidth={2.5} />
              </button>
            </div>
            <p className="docpage-subhead">
              <CalendarDays size={15} strokeWidth={2} />
              General daily availability
            </p>
            <ul className="docpage-slot-list">
              {rows.map((r) => (
                <li key={r.id} className="docpage-slot-row">
                  <span className="docpage-slot-day">{r.day}</span>
                  <div className="docpage-slot-times">
                    <div className="docpage-time-field">
                      <Clock3 size={14} className="docpage-time-ico" aria-hidden />
                      <input readOnly value={r.start} />
                    </div>
                    <ArrowRight size={16} className="docpage-slot-arrow" aria-hidden />
                    <div className="docpage-time-field">
                      <Clock3 size={14} className="docpage-time-ico" aria-hidden />
                      <input readOnly value={r.end} />
                    </div>
                  </div>
                  <div className="docpage-slot-actions">
                    <button type="button" className="docpage-slot-icon" aria-label="Remove">
                      <X size={16} strokeWidth={2} />
                    </button>
                    <button type="button" className="docpage-slot-icon" aria-label="Add">
                      <Plus size={16} strokeWidth={2} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="docpage-footer-actions">
              <button type="button" className="pill-btn dark pill-btn-navy docpage-save">
                <Check size={18} strokeWidth={2.4} />
                Save Changes
              </button>
            </div>
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
                    <input placeholder="DD/MM/YYYY" />
                  </div>
                  <div className="docpage-time-field docpage-ooo-input">
                    <Clock3 size={14} />
                    <input placeholder="00:00:00" />
                  </div>
                  <label className="docpage-ooo-check">
                    <input type="checkbox" /> Full day
                  </label>
                </div>
              </div>
              <div className="docpage-ooo-row">
                <span className="docpage-ooo-label">TO</span>
                <div className="docpage-ooo-fields">
                  <div className="docpage-time-field docpage-ooo-input">
                    <CalendarDays size={14} />
                    <input placeholder="DD/MM/YYYY" />
                  </div>
                  <div className="docpage-time-field docpage-ooo-input">
                    <Clock3 size={14} />
                    <input placeholder="00:00:00" />
                  </div>
                  <label className="docpage-ooo-check">
                    <input type="checkbox" /> Full day
                  </label>
                </div>
              </div>
              <div className="docpage-ooo-actions">
                <button type="button" className="docpage-ooo-x" onClick={() => setOooOpen(false)} aria-label="Cancel">
                  <X size={18} />
                </button>
                <button type="button" className="pill-btn dark pill-btn-navy" onClick={() => setOooOpen(false)}>
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
