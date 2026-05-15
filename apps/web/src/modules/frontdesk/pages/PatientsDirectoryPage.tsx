import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Mail,
  Pencil,
  Phone,
  Search,
  SlidersHorizontal,
  Users,
  X
} from "lucide-react";

type Modal = "none" | "create" | "registration";

const tableRows = [
  {
    id: "PT-8821",
    name: "Sarah Montgomery",
    phone: "(555) 123-4567",
    age: "77",
    type: "Blue",
    date: "2023-10-24",
    initials: "SM",
    hue: "mint"
  },
  {
    id: "PT-8822",
    name: "James Chen",
    phone: "(555) 234-5678",
    age: "54",
    type: "Blue",
    date: "2023-09-12",
    initials: "JC",
    hue: "sky"
  },
  {
    id: "PT-8823",
    name: "Maria Garcia",
    phone: "(555) 876-5432",
    age: "41",
    type: "Blue",
    date: "2023-11-01",
    initials: "MG",
    hue: "lav"
  },
  {
    id: "PT-8824",
    name: "David Okonkwo",
    phone: "(555) 445-0099",
    age: "62",
    type: "Blue",
    date: "2023-08-30",
    initials: "DO",
    hue: "mint"
  },
  {
    id: "PT-8825",
    name: "Elena Rossi",
    phone: "(555) 332-1100",
    age: "35",
    type: "Blue",
    date: "2023-10-05",
    initials: "ER",
    hue: "sky"
  }
];

const registrationRows = [
  { id: "r1", name: "Fatima Khan", email: "fatima.khan@example.com", age: "34", gender: "Female", mobile: "+91 1212093000", initials: "FK", hue: "sky" },
  { id: "r2", name: "James Patel", email: "james.patel@example.com", age: "28", gender: "Male", mobile: "+91 1212093001", initials: "JP", hue: "mint" },
  { id: "r3", name: "Olivia Smith", email: "olivia.smith@example.com", age: "45", gender: "Female", mobile: "+91 1212093002", initials: "OS", hue: "lav" },
  { id: "r4", name: "Noah Brown", email: "noah.brown@example.com", age: "31", gender: "Male", mobile: "+91 1212093003", initials: "NB", hue: "sky" }
];

export function PatientsDirectoryPage() {
  const [modal, setModal] = useState<Modal>("none");
  const [regSelected, setRegSelected] = useState<Record<string, boolean>>({});

  const regAny = useMemo(() => Object.values(regSelected).some(Boolean), [regSelected]);

  return (
    <div className="screen-wrap calendar-screen doc-pat-screen patpage-wrap">
      <section className="patpage-hero-card">
        <div className="patpage-hero-left">
          <p className="patpage-hero-k">TOTAL PATIENTS</p>
          <p className="patpage-hero-num">12,480</p>
          <div className="patpage-hero-bars">
            <span className="patpage-bar patpage-bar-a" style={{ width: "8%" }} title="1,000" />
            <span className="patpage-bar patpage-bar-b" style={{ width: "24%" }} title="3,000" />
            <span className="patpage-bar patpage-bar-g" style={{ width: "68%" }} title="8,480" />
          </div>
          <div className="patpage-hero-legend">
            <span>1,000</span>
            <span>3,000</span>
            <span>8,480</span>
          </div>
        </div>
        <Users size={40} strokeWidth={1.5} className="patpage-hero-icon" aria-hidden />
      </section>

      <header className="patpage-header">
        <div>
          <h1 className="patpage-title">Patient Directory</h1>
          <p className="patpage-sub">Manage and track patient information and EMR profiles</p>
          <div className="patpage-quick">
            <div>
              <span className="patpage-quick-k">ACTIVE PATIENTS</span>
              <strong>1,284</strong>
              <span className="patpage-pill-up">+2.4%</span>
            </div>
            <div>
              <span className="patpage-quick-k">VISITS TODAY</span>
              <strong>42</strong>
            </div>
          </div>
        </div>
        <button type="button" className="pill-btn dark pill-btn-navy patpage-new" onClick={() => setModal("create")}>
          + New Patient Registration
        </button>
      </header>

      <div className="patpage-toolbar">
        <div className="patpage-search">
          <Search size={17} strokeWidth={2} aria-hidden />
          <input placeholder="Search by name or ID..." />
        </div>
        <button type="button" className="patpage-filter">
          <SlidersHorizontal size={16} />
          Filters
          <ChevronDown size={14} />
        </button>
        <button type="button" className="patpage-export">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="patpage-table-card">
        <table className="patpage-table">
          <thead>
            <tr>
              <th>PATIENT ID</th>
              <th>PATIENT NAME</th>
              <th>PHONE NUMBER</th>
              <th>AGE</th>
              <th>TYPE</th>
              <th>DATE OF EN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.id}>
                <td className="patpage-mono">{row.id}</td>
                <td>
                  <div className="patpage-namecell">
                    <span className={`patpage-av patpage-av-${row.hue}`}>{row.initials}</span>
                    <span>{row.name}</span>
                  </div>
                </td>
                <td>{row.phone}</td>
                <td className="patpage-center">{row.age}</td>
                <td>
                  <span className="patpage-type-tag">{row.type}</span>
                </td>
                <td>{row.date}</td>
                <td>
                  <div className="patpage-actions">
                    <button type="button" className="patpage-edit" aria-label="Edit">
                      <Pencil size={14} />
                    </button>
                    <Link to={`/frontdesk/patients/profile/${encodeURIComponent(row.id)}`} className="patpage-view">
                      View Profile
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <footer className="patpage-pagination">
          <span>Showing 1 to 5 of 1,284 patients</span>
          <div className="patpage-pages">
            <button type="button" className="patpage-page patpage-page-on">
              1
            </button>
            <button type="button" className="patpage-page">
              2
            </button>
            <button type="button" className="patpage-page">
              3
            </button>
            <span className="patpage-page-ellipsis">…</span>
            <button type="button" className="patpage-page">
              129
            </button>
          </div>
        </footer>
      </div>

      {modal !== "none" && (
        <div className="screen-overlay" onClick={() => setModal("none")}>
          <div
            className={`modal-card${modal === "registration" ? " patpage-reg-modal" : " patpage-create-modal"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {modal === "create" && (
              <div className="modal-content patpage-create-inner">
                <button type="button" className="close-modal icon-btn" onClick={() => setModal("none")} aria-label="Close">
                  <X size={16} />
                </button>
                <div className="patpage-create-top">
                  <button type="button" className="patpage-sheet-btn" onClick={() => setModal("registration")}>
                    Select from registration sheet
                  </button>
                </div>
                <h2 className="patpage-create-title">Create Patient</h2>
                <form
                  className="patpage-create-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setModal("none");
                  }}
                >
                  <div className="patpage-form-grid patpage-form-3">
                    <label className="patpage-lbl">
                      First name <span className="patpage-req">*</span>
                    </label>
                    <label className="patpage-lbl">
                      Last name <span className="patpage-req">*</span>
                    </label>
                    <label className="patpage-lbl">
                      Gender <span className="patpage-req">*</span>
                    </label>
                    <input className="popup-field" placeholder="Fatima" required />
                    <input className="popup-field" placeholder="Khan" required />
                    <div className="patpage-radios">
                      <label>
                        <input type="radio" name="gender" defaultChecked /> Female
                      </label>
                      <label>
                        <input type="radio" name="gender" /> Male
                      </label>
                      <label>
                        <input type="radio" name="gender" /> Other
                      </label>
                    </div>
                  </div>
                  <div className="patpage-form-grid patpage-form-4">
                    <label className="patpage-lbl">
                      Mobile number <span className="patpage-req">*</span>
                    </label>
                    <label className="patpage-lbl">
                      Date of birth <span className="patpage-req">*</span>
                    </label>
                    <label className="patpage-lbl">
                      Age <span className="patpage-req">*</span>
                    </label>
                    <label className="patpage-lbl">
                      Email address <span className="patpage-req">*</span>
                    </label>
                    <div className="patpage-field-ico">
                      <Phone size={14} />
                      <input placeholder="+91 1212093000" />
                    </div>
                    <div className="patpage-field-ico">
                      <CalendarDays size={14} />
                      <input placeholder="DD/MM/YYYY" />
                    </div>
                    <input className="popup-field" placeholder="34" />
                    <div className="patpage-field-ico">
                      <Mail size={14} />
                      <input placeholder="emily.davis@example.com" />
                    </div>
                  </div>
                  <label className="patpage-lbl patpage-lbl-full">
                    Address <span className="patpage-req">*</span>
                  </label>
                  <textarea className="patpage-textarea" rows={3} placeholder="1-8-538/8/c, 3rd floor, chikkadpally..." />
                  <div className="patpage-form-grid patpage-form-3">
                    <label className="patpage-lbl">City</label>
                    <label className="patpage-lbl">Pin code</label>
                    <label className="patpage-lbl">State</label>
                    <input className="popup-field" placeholder="Hyderabad" />
                    <input className="popup-field" placeholder="500020" />
                    <select className="popup-field" defaultValue="ts">
                      <option value="ts">Telangana</option>
                      <option value="ka">Karnataka</option>
                      <option value="mh">Maharashtra</option>
                    </select>
                  </div>
                  <div className="patpage-create-footer">
                    <button type="button" className="pill-btn light" onClick={() => setModal("none")}>
                      <X size={16} />
                      Cancel
                    </button>
                    <button type="submit" className="pill-btn dark pill-btn-navy">
                      <Check size={17} strokeWidth={2.4} />
                      Create Patient
                    </button>
                  </div>
                </form>
              </div>
            )}

            {modal === "registration" && (
              <div className="modal-content patpage-reg-inner">
                <button type="button" className="close-modal icon-btn" onClick={() => setModal("create")} aria-label="Back">
                  <X size={16} />
                </button>
                <h2 className="patpage-reg-title">REGISTRATION FORMS DATA</h2>
                <div className="patpage-reg-table-wrap">
                  <table className="patpage-reg-table">
                    <thead>
                      <tr>
                        <th className="patpage-reg-check" />
                        <th>PATIENT NAME</th>
                        <th>AGE</th>
                        <th>GENDER</th>
                        <th>MOBILE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrationRows.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={!!regSelected[r.id]}
                              onChange={(e) => setRegSelected((s) => ({ ...s, [r.id]: e.target.checked }))}
                            />
                          </td>
                          <td>
                            <div className="patpage-reg-name">
                              <span className={`patpage-av patpage-av-${r.hue}`}>{r.initials}</span>
                              <span>
                                <strong>{r.name}</strong>
                                <small>{r.email}</small>
                              </span>
                            </div>
                          </td>
                          <td>{r.age}</td>
                          <td>{r.gender}</td>
                          <td>{r.mobile}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="patpage-reg-footer">
                  <button
                    type="button"
                    className="pill-btn dark pill-btn-navy"
                    disabled={!regAny}
                    onClick={() => {
                      setModal("create");
                      setRegSelected({});
                    }}
                  >
                    <Check size={17} strokeWidth={2.4} />
                    Select and use data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
