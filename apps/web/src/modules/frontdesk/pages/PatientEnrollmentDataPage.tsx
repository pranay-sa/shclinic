import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "@/core/http";

type EnrollRow = {
  id: string;
  sr: number;
  regMonth: string;
  regDate: string;
  time: string;
  shift: string;
  patientName: string;
  first: string;
  last: string;
  gender: string;
  mobile: string;
  email: string;
  initials: string;
  hue: "sky" | "mint" | "lav" | "peach";
};

type ApiPatient = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  mobile: string;
  email: string | null;
  created_at?: string;
};

const hues: EnrollRow["hue"][] = ["sky", "mint", "lav", "peach"];

function shiftForHour(hour: number): string {
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export function PatientEnrollmentDataPage() {
  const [patients, setPatients] = useState<ApiPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    apiRequest<{ items: ApiPatient[] }>("/patients?search=&page=1&pageSize=200")
      .then((resp) => setPatients(resp.items))
      .catch(() => setError("Unable to load patient enrollment data."))
      .finally(() => setIsLoading(false));
  }, []);

  const rows: EnrollRow[] = useMemo(() => {
    return patients.map((p, idx) => {
      const created = p.created_at ? new Date(p.created_at) : new Date();
      const hour = created.getHours();
      const initials = (p.first_name?.charAt(0) ?? "?").toUpperCase();
      return {
        id: p.id,
        sr: idx + 1,
        regMonth: created.toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
        regDate: created.toLocaleDateString("en-GB"),
        time: created.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        shift: shiftForHour(hour),
        patientName: `${p.first_name} ${p.last_name}`.trim(),
        first: p.first_name,
        last: p.last_name,
        gender: p.gender,
        mobile: p.mobile,
        email: p.email ?? "-",
        initials,
        hue: hues[idx % hues.length],
      };
    });
  }, [patients]);

  return (
    <div className="screen-wrap calendar-screen doc-pat-screen others-data">
      <Link to="/frontdesk/others" className="others-back">
        ← Others
      </Link>
      <div className="others-panel">
        <h1 className="others-data-title">Patient enrollment data — branch name</h1>
        <div className="others-table-scroll">
          <table className="others-table others-table-enroll">
            <thead>
              <tr>
                <th>Sr. no.</th>
                <th>Registration month</th>
                <th>Registration date</th>
                <th>Time</th>
                <th>Shift</th>
                <th>Patient name</th>
                <th>First name</th>
                <th>Last name</th>
                <th>Gender</th>
                <th>Mobile</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11}>Loading...</td>
                </tr>
              ) : null}
              {error ? (
                <tr>
                  <td colSpan={11}>{error}</td>
                </tr>
              ) : null}
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.sr}</td>
                  <td>{r.regMonth}</td>
                  <td>{r.regDate}</td>
                  <td>{r.time}</td>
                  <td>{r.shift}</td>
                  <td>{r.patientName}</td>
                  <td>
                    <div className="others-name-cell">
                      <span className={`others-av others-av-${r.hue}`}>{r.initials}</span>
                      <span>{r.first}</span>
                    </div>
                  </td>
                  <td>{r.last}</td>
                  <td>{r.gender}</td>
                  <td>{r.mobile}</td>
                  <td>{r.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
