import { useEffect, useMemo, useState } from "react";
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
  X,
} from "lucide-react";
import { apiRequest } from "@/core/http";

type Modal = "none" | "create" | "registration";

type ApiPatient = {
  id: string;
  patient_code: string;
  first_name: string;
  last_name: string;
  mobile: string;
  gender: string;
  date_of_birth: string;
};

type TableRow = {
  uuid: string;
  id: string;
  name: string;
  phone: string;
  age: string;
  type: string;
  date: string;
  initials: string;
  hue: "mint" | "sky" | "lav";
};

type CreatePatientFormState = {
  firstName: string;
  lastName: string;
  gender: "Female" | "Male" | "Other";
  mobile: string;
  dob: string;
  age: string;
  email: string;
  address: string;
  city: string;
  pin: string;
  state: string;
};

const registrationRows = [
  {
    id: "r1",
    firstName: "Fatima",
    lastName: "Khan",
    email: "fatima.khan@example.com",
    age: "34",
    gender: "Female" as const,
    mobile: "+91 1212093000",
    initials: "FK",
    hue: "sky" as const,
    address: "BTM 2nd Stage",
    city: "Bengaluru",
    pin: "560076",
    state: "Karnataka",
  },
  {
    id: "r2",
    firstName: "James",
    lastName: "Patel",
    email: "james.patel@example.com",
    age: "28",
    gender: "Male" as const,
    mobile: "+91 1212093001",
    initials: "JP",
    hue: "mint" as const,
    address: "Andheri West",
    city: "Mumbai",
    pin: "400053",
    state: "Maharashtra",
  },
  {
    id: "r3",
    firstName: "Olivia",
    lastName: "Smith",
    email: "olivia.smith@example.com",
    age: "45",
    gender: "Female" as const,
    mobile: "+91 1212093002",
    initials: "OS",
    hue: "lav" as const,
    address: "Jubilee Hills",
    city: "Hyderabad",
    pin: "500033",
    state: "Telangana",
  },
];

const initialFormState: CreatePatientFormState = {
  firstName: "",
  lastName: "",
  gender: "Female",
  mobile: "",
  dob: "",
  age: "",
  email: "",
  address: "",
  city: "",
  pin: "",
  state: "",
};

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

export function PatientsDirectoryPage() {
  const [modal, setModal] = useState<Modal>("none");
  const [regSelected, setRegSelected] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tableRows, setTableRows] = useState<TableRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [formState, setFormState] = useState<CreatePatientFormState>(initialFormState);

  const regAny = useMemo(() => Object.values(regSelected).some(Boolean), [regSelected]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setIsLoading(true);
    setListError(null);
    apiRequest<{ items: ApiPatient[]; total: number }>(
      `/patients?search=${encodeURIComponent(debouncedSearch)}&page=${page}&pageSize=${pageSize}`,
    )
      .then((resp) => {
        setTotal(resp.total);
        setTableRows(
          resp.items.map((item, index) => ({
            uuid: item.id,
            id: item.patient_code,
            name: `${item.first_name} ${item.last_name}`,
            phone: item.mobile,
            age: calculateAge(item.date_of_birth),
            type: item.gender,
            date: item.date_of_birth,
            initials: `${item.first_name[0] ?? ""}${item.last_name[0] ?? ""}`.toUpperCase(),
            hue: (["mint", "sky", "lav"] as const)[index % 3],
          })),
        );
      })
      .catch(() => setListError("Unable to load patient list. Please check login/session."))
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, page, pageSize, refreshKey]);

  function resetCreateForm() {
    setFormState(initialFormState);
    setCreateError(null);
    setRegSelected({});
  }

  function applyRegistrationSelection() {
    const selectedId = Object.keys(regSelected).find((id) => regSelected[id]);
    if (!selectedId) return;
    const selected = registrationRows.find((row) => row.id === selectedId);
    if (!selected) return;
    setFormState({
      firstName: selected.firstName,
      lastName: selected.lastName,
      gender: selected.gender,
      mobile: selected.mobile,
      dob: "",
      age: selected.age,
      email: selected.email,
      address: selected.address,
      city: selected.city,
      pin: selected.pin,
      state: selected.state,
    });
    setRegSelected({});
    setModal("create");
  }

  const stateValue = formState.state.toLowerCase();

  return (
    <div className="screen-wrap calendar-screen doc-pat-screen patpage-wrap">
      <section className="patpage-hero-card">
        <div className="patpage-hero-left">
          <p className="patpage-hero-k">TOTAL PATIENTS</p>
          <p className="patpage-hero-num">{total.toLocaleString()}</p>
          <div className="patpage-hero-bars">
            <span className="patpage-bar patpage-bar-a" style={{ width: total ? "15%" : "0%" }} />
            <span className="patpage-bar patpage-bar-b" style={{ width: total ? "35%" : "0%" }} />
            <span className="patpage-bar patpage-bar-g" style={{ width: total ? "50%" : "0%" }} />
          </div>
          <div className="patpage-hero-legend">
            <span>{Math.max(0, Math.floor(total * 0.15)).toLocaleString()}</span>
            <span>{Math.max(0, Math.floor(total * 0.35)).toLocaleString()}</span>
            <span>{Math.max(0, Math.floor(total * 0.5)).toLocaleString()}</span>
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
              <strong>{total.toLocaleString()}</strong>
            </div>
            <div>
              <span className="patpage-quick-k">VISITS TODAY</span>
              <strong>{tableRows.length}</strong>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="pill-btn dark pill-btn-navy patpage-new"
          onClick={() => {
            resetCreateForm();
            setModal("create");
          }}
        >
          + New Patient Registration
        </button>
      </header>

      <div className="patpage-toolbar">
        <div className="patpage-search">
          <Search size={17} strokeWidth={2} aria-hidden />
          <input
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
              <th>DATE OF BIRTH</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.uuid}>
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
                    <Link
                      to={`/frontdesk/patients/profile/${encodeURIComponent(row.uuid)}`}
                      className="patpage-view"
                    >
                      View Profile
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? <p className="patpage-sub">Loading patients...</p> : null}
        {listError ? <p className="patpage-sub">{listError}</p> : null}
        <footer className="patpage-pagination">
          <span>
            Showing {startIndex} to {endIndex} of {total} patients
          </span>
          <div className="patpage-pages">
            <button
              type="button"
              className="patpage-page"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button type="button" className="patpage-page patpage-page-on">
              {page}
            </button>
            <button
              type="button"
              className="patpage-page"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
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
                {createError ? <p className="patpage-sub">{createError}</p> : null}
                <form
                  className="patpage-create-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setCreateError(null);
                    try {
                      await apiRequest("/patients", {
                        method: "POST",
                        body: {
                          firstName: formState.firstName.trim(),
                          lastName: formState.lastName.trim(),
                          gender: formState.gender,
                          dateOfBirth: formState.dob,
                          mobile: formState.mobile.trim(),
                          email: formState.email.trim(),
                          address: formState.address.trim(),
                          city: formState.city.trim(),
                          state: formState.state.trim(),
                          pin: formState.pin.trim(),
                        },
                      });
                      setModal("none");
                      setRefreshKey((v) => v + 1);
                      resetCreateForm();
                    } catch {
                      setCreateError("Unable to create patient. Check required details and try again.");
                    }
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
                    <input
                      className="popup-field"
                      placeholder="Fatima"
                      required
                      value={formState.firstName}
                      onChange={(e) => setFormState((s) => ({ ...s, firstName: e.target.value }))}
                    />
                    <input
                      className="popup-field"
                      placeholder="Khan"
                      required
                      value={formState.lastName}
                      onChange={(e) => setFormState((s) => ({ ...s, lastName: e.target.value }))}
                    />
                    <div className="patpage-radios">
                      {(["Female", "Male", "Other"] as const).map((gender) => (
                        <label key={gender}>
                          <input
                            type="radio"
                            name="gender"
                            value={gender}
                            checked={formState.gender === gender}
                            onChange={() => setFormState((s) => ({ ...s, gender }))}
                          />{" "}
                          {gender}
                        </label>
                      ))}
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
                      <input
                        placeholder="+91 1212093000"
                        required
                        minLength={8}
                        value={formState.mobile}
                        onChange={(e) => setFormState((s) => ({ ...s, mobile: e.target.value }))}
                      />
                    </div>
                    <div className="patpage-field-ico">
                      <CalendarDays size={14} />
                      <input
                        type="date"
                        required
                        value={formState.dob}
                        onChange={(e) =>
                          setFormState((s) => ({
                            ...s,
                            dob: e.target.value,
                            age: calculateAge(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <input
                      className="popup-field"
                      placeholder="34"
                      required
                      inputMode="numeric"
                      pattern="[0-9]+"
                      value={formState.age}
                      onChange={(e) =>
                        setFormState((s) => ({
                          ...s,
                          age: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                    />
                    <div className="patpage-field-ico">
                      <Mail size={14} />
                      <input
                        type="email"
                        required
                        placeholder="emily.davis@example.com"
                        value={formState.email}
                        onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <label className="patpage-lbl patpage-lbl-full">
                    Address <span className="patpage-req">*</span>
                  </label>
                  <textarea
                    className="patpage-textarea"
                    rows={3}
                    required
                    placeholder="1-8-538/8/c, 3rd floor, chikkadpally..."
                    value={formState.address}
                    onChange={(e) => setFormState((s) => ({ ...s, address: e.target.value }))}
                  />
                  <div className="patpage-form-grid patpage-form-3">
                    <label className="patpage-lbl">
                      City <span className="patpage-req">*</span>
                    </label>
                    <label className="patpage-lbl">
                      Pin code <span className="patpage-req">*</span>
                    </label>
                    <label className="patpage-lbl">
                      State <span className="patpage-req">*</span>
                    </label>
                    <input
                      className="popup-field"
                      placeholder="Hyderabad"
                      required
                      value={formState.city}
                      onChange={(e) => setFormState((s) => ({ ...s, city: e.target.value }))}
                    />
                    <input
                      className="popup-field"
                      placeholder="500020"
                      required
                      inputMode="numeric"
                      pattern="[0-9]+"
                      value={formState.pin}
                      onChange={(e) =>
                        setFormState((s) => ({
                          ...s,
                          pin: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                    />
                    <select
                      className="popup-field"
                      value={stateValue}
                      required
                      onChange={(e) => setFormState((s) => ({ ...s, state: e.target.value }))}
                    >
                      <option value="" disabled>
                        Select state
                      </option>
                      <option value="telangana">Telangana</option>
                      <option value="karnataka">Karnataka</option>
                      <option value="maharashtra">Maharashtra</option>
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
                              onChange={(e) =>
                                setRegSelected((s) => ({
                                  ...Object.keys(s).reduce<Record<string, boolean>>((acc, key) => {
                                    acc[key] = false;
                                    return acc;
                                  }, {}),
                                  [r.id]: e.target.checked,
                                }))
                              }
                            />
                          </td>
                          <td>
                            <div className="patpage-reg-name">
                              <span className={`patpage-av patpage-av-${r.hue}`}>{r.initials}</span>
                              <span>
                                <strong>
                                  {r.firstName} {r.lastName}
                                </strong>
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
                    onClick={applyRegistrationSelection}
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
