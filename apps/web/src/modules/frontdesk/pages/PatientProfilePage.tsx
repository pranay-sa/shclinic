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

const tx = [
  { id: "t1", label: "Lab test discount", delta: 50, up: true, date: "Oct 18, 2023" },
  { id: "t2", label: "Consultation discount", delta: -200, up: false, date: "Oct 12, 2023" },
  { id: "t3", label: "C & L discount", delta: 100, up: true, date: "Sep 30, 2023" },
  { id: "t4", label: "Consultation discount", delta: 50, up: true, date: "Sep 15, 2023" }
];

export function PatientProfilePage() {
  const { patientId } = useParams();

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
              <span className="patprofile-hero-initials">SJ</span>
            </div>
            <div>
              <h1 className="patprofile-name">Sarah Jenkins</h1>
              <p className="patprofile-id">{patientId ? decodeURIComponent(patientId) : "PT-2023-8472"}</p>
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
              <div className="patprofile-grid">
                <div className="patprofile-kv">
                  <Phone size={15} className="patprofile-kv-ico" />
                  <span className="patprofile-kv-k">Phone number</span>
                  <span className="patprofile-kv-v">+1 (555) 123-4567</span>
                </div>
                <div className="patprofile-kv">
                  <Mail size={15} className="patprofile-kv-ico" />
                  <span className="patprofile-kv-k">Email address</span>
                  <span className="patprofile-kv-v">sarah.jenkins@example.com</span>
                </div>
                <div className="patprofile-kv">
                  <CalendarDays size={15} className="patprofile-kv-ico" />
                  <span className="patprofile-kv-k">Date of birth</span>
                  <span className="patprofile-kv-v">Oct 12, 1981 (42 yrs)</span>
                </div>
                <div className="patprofile-kv">
                  <UserRound size={15} className="patprofile-kv-ico" />
                  <span className="patprofile-kv-k">Gender</span>
                  <span className="patprofile-kv-v">Female</span>
                </div>
                <div className="patprofile-kv patprofile-kv-wide">
                  <MapPin size={15} className="patprofile-kv-ico" />
                  <span className="patprofile-kv-k">Address</span>
                  <span className="patprofile-kv-v">123 Maple Street, Apt 4B, Springfield, IL 62704</span>
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
                  <strong>Jan 15, 2022</strong>
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
