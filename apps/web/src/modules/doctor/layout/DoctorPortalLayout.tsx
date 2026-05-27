import { CalendarDays, FileText, Home, LogOut, MapPin, UsersRound } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { DoctorBrandLogo } from "@/modules/doctor/components/DoctorBrandLogo";
import { authStore } from "@/core/auth";

const doctorMenu = [
  { id: "home", label: "Home", path: "/doctor/home", icon: Home },
  { id: "calendar", label: "Calender", path: "/doctor/calendar", icon: CalendarDays },
  { id: "patients", label: "Patients", path: "/doctor/patients", icon: UsersRound },
  { id: "prescriptions", label: "Prescription", path: "/doctor/prescriptions", icon: FileText }
] as const;

function navClass(pathname: string, path: string) {
  return pathname.startsWith(path) ? "doctor-nav-link doctor-nav-link-active" : "doctor-nav-link";
}

export function DoctorPortalLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="doctor-shell">
      <aside className="doctor-sidebar">
        <div className="doctor-sidebar-brand">
          <DoctorBrandLogo className="doctor-sidebar-logo" />
          <span>Sugar&amp;Heart Clinic</span>
        </div>

        <nav className="doctor-nav">
          {doctorMenu.map((item) => (
            <NavLink key={item.id} to={item.path} className={navClass(pathname, item.path)}>
              <item.icon size={17} strokeWidth={1.95} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="doctor-sidebar-footer">
          <p>29 November 2025</p>
          <p>Saturday</p>
          <div className="doctor-sidebar-location">
            <MapPin size={14} strokeWidth={2} />
            Goregaon - Mumbai
          </div>
          <button
            type="button"
            className="doctor-sidebar-logout"
            onClick={() => {
              authStore.clear();
              navigate("/doctor/login");
            }}
          >
            <LogOut size={16} strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>
      <main className="doctor-main">
        <Outlet />
      </main>
    </div>
  );
}
