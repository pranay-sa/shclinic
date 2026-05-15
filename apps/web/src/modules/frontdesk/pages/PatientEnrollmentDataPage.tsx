import { Link } from "react-router-dom";

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

const rows: EnrollRow[] = [
  {
    id: "e1",
    sr: 1,
    regMonth: "Nov 2026",
    regDate: "28/11/2026",
    time: "09:15 AM",
    shift: "Morning",
    patientName: "Mrs. Fatima Khan",
    first: "Fatima",
    last: "Khan",
    gender: "Female",
    mobile: "+91 98200 11220",
    email: "fatima.k@example.com",
    initials: "F",
    hue: "sky"
  },
  {
    id: "e2",
    sr: 2,
    regMonth: "Nov 2026",
    regDate: "27/11/2026",
    time: "10:40 AM",
    shift: "Morning",
    patientName: "Mr. Rahul Sharma",
    first: "Rahul",
    last: "Sharma",
    gender: "Male",
    mobile: "+91 98190 33441",
    email: "rahul.s@example.com",
    initials: "R",
    hue: "mint"
  },
  {
    id: "e3",
    sr: 3,
    regMonth: "Nov 2026",
    regDate: "26/11/2026",
    time: "02:05 PM",
    shift: "Afternoon",
    patientName: "Ms. Emily Davis",
    first: "Emily",
    last: "Davis",
    gender: "Female",
    mobile: "+91 98210 55662",
    email: "emily.d@example.com",
    initials: "E",
    hue: "lav"
  },
  {
    id: "e4",
    sr: 4,
    regMonth: "Nov 2026",
    regDate: "25/11/2026",
    time: "11:20 AM",
    shift: "Morning",
    patientName: "Mrs. Sanya Mirza",
    first: "Sanya",
    last: "Mirza",
    gender: "Female",
    mobile: "+91 98330 77883",
    email: "sanya.m@example.com",
    initials: "S",
    hue: "peach"
  },
  {
    id: "e5",
    sr: 5,
    regMonth: "Oct 2026",
    regDate: "31/10/2026",
    time: "09:00 AM",
    shift: "Morning",
    patientName: "Mr. James Patel",
    first: "James",
    last: "Patel",
    gender: "Male",
    mobile: "+91 98765 99004",
    email: "james.p@example.com",
    initials: "J",
    hue: "sky"
  },
  {
    id: "e6",
    sr: 6,
    regMonth: "Oct 2026",
    regDate: "22/10/2026",
    time: "04:30 PM",
    shift: "Evening",
    patientName: "Ms. Olivia Brown",
    first: "Olivia",
    last: "Brown",
    gender: "Female",
    mobile: "+91 98112 22005",
    email: "olivia.b@example.com",
    initials: "O",
    hue: "mint"
  },
  {
    id: "e7",
    sr: 7,
    regMonth: "Oct 2026",
    regDate: "15/10/2026",
    time: "10:10 AM",
    shift: "Morning",
    patientName: "Mr. William Taylor",
    first: "William",
    last: "Taylor",
    gender: "Male",
    mobile: "+91 98989 10007",
    email: "william.t@example.com",
    initials: "W",
    hue: "lav"
  }
];

export function PatientEnrollmentDataPage() {
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
