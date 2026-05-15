import { Link } from "react-router-dom";

type RegRow = {
  id: string;
  first: string;
  last: string;
  gender: string;
  dob: string;
  age: number;
  address: string;
  city: string;
  state: string;
  pin: string;
  initials: string;
  hue: "sky" | "mint" | "lav" | "peach";
};

const rows: RegRow[] = [
  {
    id: "1",
    first: "Fatima",
    last: "Khan",
    gender: "Female",
    dob: "12/05/1990",
    age: 34,
    address: "House 42, Green Valley",
    city: "Mumbai",
    state: "Maharashtra",
    pin: "400056",
    initials: "F",
    hue: "sky"
  },
  {
    id: "2",
    first: "Emily",
    last: "Davis",
    gender: "Female",
    dob: "08/11/1995",
    age: 28,
    address: "Flat 102, Blue Heights",
    city: "Bangalore",
    state: "Karnataka",
    pin: "560034",
    initials: "E",
    hue: "mint"
  },
  {
    id: "3",
    first: "Rahul",
    last: "Sharma",
    gender: "Male",
    dob: "22/01/1979",
    age: 45,
    address: "Plot 5, Sector 12",
    city: "Delhi",
    state: "Delhi",
    pin: "110092",
    initials: "R",
    hue: "lav"
  },
  {
    id: "4",
    first: "Sanya",
    last: "Mirza",
    gender: "Female",
    dob: "15/09/1992",
    age: 31,
    address: "Villa 9, Palm Grove",
    city: "Hyderabad",
    state: "Telangana",
    pin: "500082",
    initials: "S",
    hue: "peach"
  },
  {
    id: "5",
    first: "James",
    last: "Patel",
    gender: "Male",
    dob: "03/04/1988",
    age: 37,
    address: "12, Lake View Road",
    city: "Pune",
    state: "Maharashtra",
    pin: "411045",
    initials: "J",
    hue: "sky"
  },
  {
    id: "6",
    first: "Olivia",
    last: "Brown",
    gender: "Female",
    dob: "19/12/2001",
    age: 24,
    address: "Tower B, Apt 404",
    city: "Chennai",
    state: "Tamil Nadu",
    pin: "600028",
    initials: "O",
    hue: "mint"
  }
];

export function RegistrationFormsDataPage() {
  return (
    <div className="screen-wrap calendar-screen doc-pat-screen others-data">
      <Link to="/frontdesk/others" className="others-back">
        ← Others
      </Link>
      <div className="others-panel">
        <h1 className="others-data-title">Registration forms data — branch name</h1>
        <div className="others-table-scroll">
          <table className="others-table">
            <thead>
              <tr>
                <th>First name</th>
                <th>Last name</th>
                <th>Gender</th>
                <th>DOB</th>
                <th>Age</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Pin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="others-name-cell">
                      <span className={`others-av others-av-${r.hue}`}>{r.initials}</span>
                      <span>{r.first}</span>
                    </div>
                  </td>
                  <td>{r.last}</td>
                  <td>{r.gender}</td>
                  <td>{r.dob}</td>
                  <td>{r.age}</td>
                  <td>{r.address}</td>
                  <td>{r.city}</td>
                  <td>{r.state}</td>
                  <td>{r.pin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
