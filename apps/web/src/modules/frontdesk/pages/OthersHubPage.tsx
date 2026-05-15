import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

export function OthersHubPage() {
  return (
    <div className="screen-wrap calendar-screen doc-pat-screen others-hub">
      <div className="others-cards">
        <Link to="/frontdesk/others/registration-forms" className="others-tile">
          <span className="others-tile-ico" aria-hidden>
            <Menu size={28} strokeWidth={2.2} />
          </span>
          <span className="others-tile-label">Registration forms data</span>
        </Link>
        <Link to="/frontdesk/others/patient-enrollment" className="others-tile">
          <span className="others-tile-ico" aria-hidden>
            <Menu size={28} strokeWidth={2.2} />
          </span>
          <span className="others-tile-label">Patient enrollment data</span>
        </Link>
      </div>
    </div>
  );
}
