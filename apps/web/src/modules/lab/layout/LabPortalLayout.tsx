import { Home, List, LogOut, MapPin, Settings, UsersRound } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LabBrandLogo } from "@/modules/lab/components/LabBrandLogo";
import { authStore } from "@/core/auth";

const labMenu = [
  { id: "home", label: "Home", path: "/lab/home", icon: Home },
  { id: "orders", label: "Orders", path: "/lab/orders", icon: List },
  { id: "patients", label: "Patients", path: "/lab/patients", icon: UsersRound }
] as const;

function getLabLinkClass(path: string, pathname: string) {
  return pathname.startsWith(path) ? "lab-sidebar-link lab-sidebar-link-active" : "lab-sidebar-link";
}

export function LabPortalLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="lab-shell">
      <aside className="lab-sidebar">
        <div className="lab-sidebar-brand">
          <div className="lab-sidebar-brand-mark" aria-hidden>
            <LabBrandLogo className="lab-brand-icon" />
          </div>
          <span className="lab-sidebar-brand-title">Sugar&amp;Heart Clinic</span>
        </div>

        <nav className="lab-sidebar-nav">
          {labMenu.map((item) => (
            <NavLink key={item.id} to={item.path} className={getLabLinkClass(item.path, pathname)}>
              <item.icon size={16} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="lab-sidebar-footer">
          <div className="lab-sidebar-meta">
            <span>29 Nov, 2026 - Saturday</span>
            <span>
              <MapPin size={12} strokeWidth={2} />
              Goregaon - Mumbai
            </span>
          </div>
          <button type="button" className="lab-sidebar-btn">
            <Settings size={15} strokeWidth={2} />
            Settings
          </button>
          <button
            type="button"
            className="lab-sidebar-btn"
            onClick={() => {
              authStore.clear();
              navigate("/lab/login");
            }}
          >
            <LogOut size={15} strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>
      <main className="lab-main-content">
        <Outlet />
      </main>
    </div>
  );
}
