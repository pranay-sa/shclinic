import { useState } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

function LoginBrandLogo() {
  return (
    <svg className="login-brand-svg" viewBox="0 0 40 40" aria-hidden>
      <ellipse cx="20" cy="9.5" rx="5.2" ry="7.2" fill="#5eead4" />
      <ellipse cx="30.5" cy="20" rx="7.2" ry="5.2" fill="#38bdf8" />
      <ellipse cx="20" cy="30.5" rx="5.2" ry="7.2" fill="#2dd4bf" />
      <ellipse cx="9.5" cy="20" rx="7.2" ry="5.2" fill="#0ea5e9" />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [clinic, setClinic] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const usernameOk = username.trim().length >= 3;
  const passwordOk = password.trim().length >= 8;
  const clinicOk = clinic.length > 0;
  const canLogin = clinicOk && usernameOk && passwordOk;

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-brand-mark">
          <LoginBrandLogo />
        </div>
        <h1 className="login-brand-title">
          <span className="login-brand-row">
            <span className="login-brand-navy">Sugar</span>
            <span className="login-brand-amp">{" \u0026 "}</span>
            <span className="login-brand-navy">Heart</span>
          </span>
          <span className="login-brand-row login-brand-row-second">
            <span className="login-brand-navy">Clinic</span>
          </span>
        </h1>
      </div>

      <form
        className="login-card"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitAttempted(true);
          if (canLogin) {
            navigate("/frontdesk/home");
          }
        }}
        noValidate
      >
        <h2 className="login-card-title">Clinic Log in</h2>

        <label className="login-field">
          <span className="login-field-label">Select Clinic</span>
          <div className="login-input-wrap">
            <select
              className={submitAttempted && !clinicOk ? "login-input login-input-invalid" : "login-input"}
              value={clinic}
              onChange={(e) => setClinic(e.target.value)}
            >
              <option value="">Select Clinic</option>
              <option value="main">Main Clinic</option>
              <option value="andheri">Andheri Branch</option>
              <option value="goregaon">Goregaon — Mumbai</option>
            </select>
            <ChevronDown className="login-input-chevron" size={18} strokeWidth={2} aria-hidden />
          </div>
        </label>

        <label className="login-field">
          <span className="login-field-label">Username</span>
          <input
            className={
              submitAttempted && !usernameOk ? "login-input login-input-invalid" : "login-input"
            }
            autoComplete="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label className="login-field">
          <span className="login-field-label">Password</span>
          <div className="login-input-wrap">
            <input
              className={
                submitAttempted && !passwordOk ? "login-input login-input-invalid" : "login-input"
              }
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
            </button>
          </div>
        </label>

        <button type="submit" className="login-submit">
          Login
        </button>
      </form>
    </div>
  );
}
