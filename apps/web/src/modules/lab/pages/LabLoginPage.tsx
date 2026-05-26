import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LabBrandLogo } from "@/modules/lab/components/LabBrandLogo";
import { apiRequest } from "@/core/http";
import { authStore } from "@/core/auth";

export function LabLoginPage() {
  const navigate = useNavigate();
  const [clinic, setClinic] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isClinicValid = clinic.length > 0;
  const isUsernameValid = username.trim().length >= 2;
  const isPasswordValid = password.trim().length >= 8;
  const canLogin = isClinicValid && isUsernameValid && isPasswordValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    setErrorMessage(null);
    if (!canLogin) return;
    apiRequest<{ accessToken: string; user: { id: string; fullName: string; role: "lab_technician"; clinicIds: string[] } }, { username: string; password: string; clinicCode: string }>(
      "/auth/login",
      {
        method: "POST",
        body: { username, password, clinicCode: clinic }
      }
    )
      .then((session) => {
        authStore.setSession(session.accessToken, session.user);
        navigate("/lab/home");
      })
      .catch(() => setErrorMessage("Invalid username, password, or clinic."));
  };

  return (
    <div className="lab-login-page">
      <div className="lab-login-brand">
        <LabBrandLogo className="lab-login-brand-icon" />
        <h1>
          <span>
            <span className="lab-login-brand-accent">Sugar</span>&amp;
            <span className="lab-login-brand-dark">Heart</span>
          </span>
          <span className="lab-login-brand-dark">Clinic</span>
        </h1>
      </div>

      <form className="lab-login-card" onSubmit={handleSubmit}>
        <p className="lab-login-kicker">Diagnostics</p>
        <h2>Log in</h2>
        <p className="lab-login-note">{errorMessage ?? "Use labtech / password123 / Main Clinic for demo access."}</p>

        <label className="lab-login-field">
          <div className="lab-login-select-wrap">
            <select
              className={isSubmitted && !isClinicValid ? "lab-login-input lab-login-input-invalid" : "lab-login-input"}
              value={clinic}
              onChange={(event) => setClinic(event.target.value)}
            >
              <option value="">Select Clinic</option>
              <option value="main">Main Clinic</option>
              <option value="andheri">Andheri Branch</option>
              <option value="goregaon">Goregaon</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </label>

        <label className="lab-login-field">
          <span>Username</span>
          <input
            className={isSubmitted && !isUsernameValid ? "lab-login-input lab-login-input-invalid" : "lab-login-input"}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="jo"
            autoComplete="username"
          />
        </label>

        <label className="lab-login-field">
          <span>Password</span>
          <div className="lab-login-password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              className={isSubmitted && !isPasswordValid ? "lab-login-input lab-login-input-invalid" : "lab-login-input"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password123"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="lab-login-eye"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </label>

        <button type="submit" className="lab-login-submit">
          Login
        </button>
      </form>
    </div>
  );
}
