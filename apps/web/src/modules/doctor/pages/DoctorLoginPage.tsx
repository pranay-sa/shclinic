import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorBrandLogo } from "@/modules/doctor/components/DoctorBrandLogo";
import { apiRequest } from "@/core/http";
import { authStore } from "@/core/auth";

export function DoctorLoginPage() {
  const navigate = useNavigate();
  const [clinic, setClinic] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clinicOk = clinic.length > 0;
  const usernameOk = username.trim().length >= 2;
  const passwordOk = password.trim().length >= 8;
  const canLogin = clinicOk && usernameOk && passwordOk;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setErrorMessage(null);
    if (!canLogin) return;
    apiRequest<
      { accessToken: string; user: { id: string; fullName: string; role: "doctor" | "clinic_admin"; clinicIds: string[] } },
      { username: string; password: string; clinicCode: string }
    >(
      "/auth/login",
      {
        method: "POST",
        body: { username, password, clinicCode: clinic }
      }
    )
      .then((session) => {
        if (!(session.user.role === "doctor" || session.user.role === "clinic_admin")) {
          throw new Error("Role not allowed");
        }
        authStore.setSession(session.accessToken, session.user);
        navigate("/doctor/home");
      })
      .catch(() => setErrorMessage("Invalid username, password, or clinic."));
  }

  return (
    <div className="doctor-login-page">
      <div className="doctor-login-brand">
        <DoctorBrandLogo className="doctor-login-logo" />
        <h1>
          <span className="doctor-login-brand-main">Sugar&amp;Heart</span>
          <span>Clinic</span>
        </h1>
      </div>

      <form className="doctor-login-card" onSubmit={handleSubmit} noValidate>
        <h2>Doctor Log in</h2>
        <p>{errorMessage ?? "Use doctor / password123 / Main Clinic for demo access."}</p>

        <label className="doctor-login-field">
          <div className="doctor-login-select">
            <select
              className={submitted && !clinicOk ? "doctor-login-input doctor-input-error" : "doctor-login-input"}
              value={clinic}
              onChange={(e) => setClinic(e.target.value)}
            >
              <option value="">Select Clinic</option>
              <option value="main">Main Clinic</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </label>

        <label className="doctor-login-field">
          <span>Username</span>
          <input
            className={submitted && !usernameOk ? "doctor-login-input doctor-input-error" : "doctor-login-input"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="jo"
            autoComplete="username"
          />
        </label>

        <label className="doctor-login-field">
          <span>Password</span>
          <div className="doctor-login-password">
            <input
              className={submitted && !passwordOk ? "doctor-login-input doctor-input-error" : "doctor-login-input"}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
              autoComplete="current-password"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <button type="submit" className="doctor-login-submit">
          Login
        </button>
      </form>
    </div>
  );
}
