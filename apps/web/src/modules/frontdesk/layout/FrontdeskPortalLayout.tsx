import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  CalendarDays,
  CircleHelp,
  CreditCard,
  FileText,
  FlaskConical,
  Home,
  List,
  LogOut,
  MapPin,
  Menu,
  Settings,
  UserRound,
  UsersRound
} from "lucide-react";
import { SidebarCrossLogo } from "./SidebarCrossLogo";

const sideMenu = [
  { id: "home", label: "Home", path: "/frontdesk/home", icon: Home },
  { id: "calendar", label: "Calender", path: "/frontdesk/calendar", icon: CalendarDays },
  { id: "lab", label: "Lab test", path: "/frontdesk/lab/collection-slots", icon: FlaskConical },
  { id: "doctors", label: "Doctors", path: "/frontdesk/doctors", icon: UserRound },
  { id: "patients", label: "Patients", path: "/frontdesk/patients", icon: UsersRound },
  { id: "queue", label: "Queue", path: "/frontdesk/queue", icon: List },
  { id: "billing", label: "Billing", path: "/frontdesk/billing", icon: CreditCard },
  { id: "medical", label: "Medical records", path: "/frontdesk/medical-records", icon: FileText },
  { id: "others", label: "Others", path: "/frontdesk/others", icon: Menu }
];

function navLinkClass(item: (typeof sideMenu)[number], pathname: string) {
  if (item.id === "lab") {
    return pathname.startsWith("/frontdesk/lab") ? "sidebar-link sidebar-link-active" : "sidebar-link";
  }
  if (item.id === "doctors") {
    return pathname.startsWith("/frontdesk/doctors") ? "sidebar-link sidebar-link-active" : "sidebar-link";
  }
  if (item.id === "patients") {
    return pathname.startsWith("/frontdesk/patients") ? "sidebar-link sidebar-link-active" : "sidebar-link";
  }
  if (item.id === "queue") {
    return pathname.startsWith("/frontdesk/queue") ? "sidebar-link sidebar-link-active" : "sidebar-link";
  }
  if (item.id === "billing") {
    return pathname.startsWith("/frontdesk/billing") ? "sidebar-link sidebar-link-active" : "sidebar-link";
  }
  if (item.id === "medical") {
    return pathname.startsWith("/frontdesk/medical-records") ? "sidebar-link sidebar-link-active" : "sidebar-link";
  }
  if (item.id === "others") {
    return pathname.startsWith("/frontdesk/others") ? "sidebar-link sidebar-link-active" : "sidebar-link";
  }
  if (item.path === "/frontdesk/home") {
    return pathname === "/frontdesk/home" && item.id === "home" ? "sidebar-link sidebar-link-active" : "sidebar-link";
  }
  return pathname === item.path ? "sidebar-link sidebar-link-active" : "sidebar-link";
}

export function FrontdeskPortalLayout() {
  const { pathname } = useLocation();

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <div className="sidebar-logo" aria-hidden>
            <SidebarCrossLogo />
          </div>
          <span className="portal-brand-title">Sugar&amp;Heart Clinic</span>
        </div>

        <nav className="sidebar-nav">
          {sideMenu.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={`${navLinkClass(item, pathname)}${
                item.id === "medical" && pathname.startsWith("/frontdesk/medical-records") ? " sidebar-link-medrec-active" : ""
              }`}
            >
              <item.icon size={17} strokeWidth={1.9} className="sidebar-link-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-meta">
            <MapPin size={12} strokeWidth={2} className="sidebar-footer-pin" />
            <div className="sidebar-footer-meta-text">
              <span className="sidebar-footer-date">29 Nov, 2026 – Saturday</span>
              <span className="sidebar-footer-place">Goregaon – Mumbai</span>
            </div>
          </div>
          <div className="sidebar-footer-actions">
            <button type="button" className="sidebar-pill-btn">
              <Settings size={16} strokeWidth={2} />
              Settings
            </button>
            <button type="button" className="sidebar-pill-btn">
              <LogOut size={16} strokeWidth={2} />
              Logout
            </button>
          </div>
          <button type="button" className="sidebar-ghost-btn">
            <CircleHelp size={15} strokeWidth={2} />
            Help
          </button>
        </div>
      </aside>

      <section className="portal-content">
        <Outlet />
      </section>
    </div>
  );
}
