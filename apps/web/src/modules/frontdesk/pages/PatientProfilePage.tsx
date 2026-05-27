import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  Clock3,
  Coins,
  Mail,
  MapPin,
  Phone,
  UserRound
} from "lucide-react";
import { apiRequest } from "@/core/http";

const tx = [
  { id: "t1", label: "Lab test discount", delta: 50, up: true, date: "Oct 18, 2023" },
  { id: "t2", label: "Consultation discount", delta: -200, up: false, date: "Oct 12, 2023" },
  { id: "t3", label: "C & L discount", delta: 100, up: true, date: "Sep 30, 2023" },
  { id: "t4", label: "Consultation discount", delta: 50, up: true, date: "Sep 15, 2023" }
];

type ApiPatientProfile = {
  id: string;
  patient_code: string;
  first_name: string;
  last_name: string;
  mobile: string;
  email: string | null;
  gender: string;
  date_of_birth: string;
  address_line: string | null;
  city: string | null;
  state: string | null;
  pin: string | null;
  created_at: string;
};

function formatDateLabel(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return "-";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function calculateAge(dateOfBirth: string): number | null {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.valueOf())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const hasBirthdayPassed =
    now.getMonth() > dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
  if (!hasBirthdayPassed) age -= 1;
  return Math.max(0, age);
}

export function PatientProfilePage() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<ApiPatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoadError("Patient id is missing in URL.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    apiRequest<ApiPatientProfile>(`/patients/${encodeURIComponent(patientId)}`)
      .then((resp) => setPatient(resp))
      .catch(() => setLoadError("Unable to load patient profile. Please return to directory and retry."))
      .finally(() => setIsLoading(false));
  }, [patientId]);

  const patientName = useMemo(() => {
    if (!patient) return "Patient";
    return `${patient.first_name} ${patient.last_name}`.trim();
  }, [patient]);

  const initials = useMemo(() => {
    if (!patient) return "NA";
    return `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`.toUpperCase();
  }, [patient]);

  const dobAgeLabel = useMemo(() => {
    if (!patient) return "-";
    const age = calculateAge(patient.date_of_birth);
    const formattedDate = formatDateLabel(patient.date_of_birth);
    if (age == null) return formattedDate;
    return `${formattedDate} (${age} yrs)`;
  }, [patient]);

  const addressLabel = useMemo(() => {
    if (!patient) return "-";
    const parts = [patient.address_line, patient.city, patient.state, patient.pin].filter(Boolean);
    return parts.length ? parts.join(", ") : "-";
  }, [patient]);

  const enrolledLabel = useMemo(() => (patient ? formatDateLabel(patient.created_at) : "-"), [patient]);
  const patientCode = patient?.patient_code ?? (patientId ? decodeURIComponent(patientId) : "-");
  const email = patient?.email ?? "-";
  const phone = patient?.mobile ?? "-";
  const gender = patient?.gender ?? "-";

  return (
    <div className="screen-wrap calendar-screen doc-pat-screen patprofile-wrap">
      <Link to="/frontdesk/patients" className="patprofile-back">
        <ChevronLeft size={18} />
        Back to directory
      </Link>

      <article className="patprofile-card">
        <header className="patprofile-head">
          <div className="patprofile-head-left">
            <div className="patprofile-hero-av" aria-hidden>
              <span className="patprofile-hero-initials">{initials}</span>
            </div>
            <div>
              <h1 className="patprofile-name">{patientName}</h1>
              <p className="patprofile-id">{patientCode}</p>
              <span className="patprofile-badge-aqua">Aqua</span>
            </div>
          </div>
          <button type="button" className="patprofile-edit">
            Edit Profile
          </button>
        </header>

        <div className="patprofile-body">
          <div className="patprofile-main">
            <section className="patprofile-block">
              <h2 className="patprofile-block-title">
                <UserRound size={17} strokeWidth={2} />
                Personal Information
              </h2>
              {isLoading ? <p className="patpage-sub">Loading patient profile...</p> : null}
              {loadError ? <p className="patpage-sub">{loadError}</p> : null}
              <div className="patprofile-grid">
                <div className="patprofile-kv">
                  <Phone size={15} className="patprofile-kv-ico" />
                  <span className="patprofile-kv-k">Phone number</span>
                  <span className="patprofile-kv-v">{phone}</span>
                </div>
                <div className="patprofile-kv">
                  <Mail size={15} className="patprofile-kv-ico" />
                  <span className="patprofile-kv-k">Email address</span>
                  <span className="patprofile-kv-v">{email}</span>
                </div>
                <div className="patprofile-kv">
                  <CalendarDays size={15} className="patprofile-kv-ico" />
                  <span className="patprofile-kv-k">Date of birth</span>
                  <span className="patprofile-kv-v">{dobAgeLabel}</span>
                </div>
                <div className="patprofile-kv">
                  <UserRound size={15} className="patprofile-kv-ico" />
                  <span className="patprofile-kv-k">Gender</span>
                  <span className="patprofile-kv-v">{gender}</span>
                </div>
                <div className="patprofile-kv patprofile-kv-wide">
                  <MapPin size={15} className="patprofile-kv-ico" />
                  <span className="patprofile-kv-k">Address</span>
                  <span className="patprofile-kv-v">{addressLabel}</span>
                </div>
              </div>
            </section>

            <section className="patprofile-block">
              <h2 className="patprofile-block-title">
                <Activity size={17} strokeWidth={2} />
                Clinic Details
              </h2>
              <div className="patprofile-clinic-row">
                <div className="patprofile-mini">
                  <Clock3 size={14} />
                  <span className="patprofile-mini-k">Enrolled On</span>
                  <strong>{enrolledLabel}</strong>
                </div>
                <div className="patprofile-mini">
                  <CalendarDays size={14} />
                  <span className="patprofile-mini-k">Last Visit</span>
                  <strong>Oct 20, 2023</strong>
                </div>
                <div className="patprofile-mini">
                  <CalendarDays size={14} />
                  <span className="patprofile-mini-k">Next Follow-up</span>
                  <strong>Nov 15, 2023</strong>
                </div>
              </div>
            </section>
          </div>

          <aside className="patprofile-coins">
            <div className="patprofile-coins-head">
              <h3>
                <Coins size={17} strokeWidth={2} />
                Sugar Coins
              </h3>
              <span className="patprofile-loyal">Loyalty Member</span>
            </div>
            <p className="patprofile-balance-k">Current Balance</p>
            <p className="patprofile-balance-num">1,250</p>
            <ul className="patprofile-tx">
              {tx.map((t) => (
                <li key={t.id} className="patprofile-tx-row">
                  <span className={`patprofile-tx-ico${t.up ? " patprofile-tx-up" : " patprofile-tx-down"}`}>
                    {t.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </span>
                  <div>
                    <span className="patprofile-tx-label">{t.label}</span>
                    <span className={`patprofile-tx-amt${t.up ? " is-up" : " is-down"}`}>
                      {t.up ? "+" : ""}
                      {t.delta}
                    </span>
                    <span className="patprofile-tx-date">{t.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </article>
    </div>
  );
}
