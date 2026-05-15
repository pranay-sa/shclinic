import {
  CalendarDays,
  FileUp,
  Flame,
  FlaskConical,
  ReceiptText,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

const quickActions = [
  { label: "Register Patient", icon: UserPlus },
  { label: "New Appt.", icon: CalendarDays },
  { label: "Add Lab Test", icon: FlaskConical },
  { label: "Billing", icon: ReceiptText },
  { label: "Upload Rx", icon: FileUp },
];

export function FrontdeskHomePage() {
  return (
    <div className="screen-wrap">
      <div className="top-search" role="search">
        <Search size={18} strokeWidth={2} className="top-search-icon" aria-hidden />
        <span className="top-search-placeholder">
          Search Patients, UHID, Phone, Prescription ID, Doctor...
        </span>
      </div>

      <div className="home-grid">
        <section className="quick-actions">
          {quickActions.map(({ label, icon: Icon }) => (
            <article className="action-card" key={label}>
              <Icon size={20} strokeWidth={1.7} className="action-icon" />
              <p>{label}</p>
            </article>
          ))}
        </section>

        <section className="stats-column">
          <article className="stat-mini-card">
            <div className="stat-header">
              <div className="stat-title">Appointments Today</div>
              <CalendarDays size={14} strokeWidth={1.8} className="stat-hicon" />
            </div>
            <div className="stat-value">42</div>
            <div className="stat-green">+ 12% from yesterday</div>
          </article>
          <article className="stat-mini-card">
            <div className="stat-header">
              <div className="stat-title">Appointments Tomorrow</div>
              <CalendarDays size={14} strokeWidth={1.8} className="stat-hicon" />
            </div>
            <div className="stat-value">38</div>
            <div className="stat-blue">Scheduled</div>
          </article>
          <article className="stat-mini-card">
            <div className="stat-header">
              <div className="stat-title">Samples Today</div>
              <Flame size={14} strokeWidth={1.8} className="stat-hicon-red" />
            </div>
            <div className="stat-value">15</div>
            <div className="stat-muted">Home Collections: 10</div>
          </article>
          <article className="stat-mini-card">
            <div className="stat-header">
              <div className="stat-title">Samples Tomorrow</div>
              <Flame size={14} strokeWidth={1.8} className="stat-hicon-red" />
            </div>
            <div className="stat-value">22</div>
            <div className="stat-muted">Home collection: 10</div>
          </article>
        </section>

        <section className="summary-column">
          <article className="panel-card">
            <div className="panel-top">
              <h3>Total Patients</h3>
              <Users size={17} strokeWidth={1.7} className="panel-icon" />
            </div>
            <div className="big-number">1,284</div>
            <div className="summary-breakup">
              <span>
                Diabetic
                <strong>412</strong>
              </span>
              <span>
                Cardiology
                <strong>189</strong>
              </span>
              <span>
                Other
                <strong>683</strong>
              </span>
            </div>
            <div className="colored-strip">
              <span className="c1">Aqua 189</span>
              <span className="c2">Blue 189</span>
              <span className="c3">Grey 189</span>
            </div>
          </article>

          <article className="panel-card">
            <h3>Total Revenue</h3>
            <div className="revenue-number">$12,450.00</div>
            <div className="revenue-bar">
              <span />
            </div>
            <div className="revenue-split">
              <div>
                <p className="revenue-label">
                  <span className="revenue-dot revenue-dot-navy" aria-hidden />
                  Consultations (75%)
                </p>
                <strong>$12,450.00</strong>
              </div>
              <div className="revenue-right">
                <p className="revenue-label">
                  <span className="revenue-dot revenue-dot-cyan" aria-hidden />
                  Diagnostics (25%)
                </p>
                <strong className="cyan">$12,450.00</strong>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
