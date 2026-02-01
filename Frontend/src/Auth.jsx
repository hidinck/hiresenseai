import { useState, useRef } from "react";
import "./Auth.css";

export default function Auth({ onLogin }) {

  const cardRef = useRef(null);

  const [mode, setMode] = useState("login"); // login | register

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= EMAIL VALIDATION =================

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ================= 3D TILT =================

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = -(y - rect.height / 2) / 18;
    const rotateY = (x - rect.width / 2) / 18;

    card.style.transform = `
      perspective(1400px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.03)
    `;
  };

  const resetTilt = () => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(1400px) rotateX(0deg) rotateY(0deg)";
    }
  };

  // ================= SUBMIT =================

  const submit = async () => {

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address 📧");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    setError("");

    const url =
      mode === "login"
        ? "https://hiresenseai.onrender.com/auth/login"
        : "https://hiresenseai.onrender.com/auth/register";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Authentication failed");
        setLoading(false);
        return;
      }

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        onLogin();
      } else if (mode === "register") {
        setMode("login");
        setError("Registered successfully — login now ✅");
      }

    } catch {
      setError("Server unreachable");
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">

      <div className="fx-layer gradient-waves" />
      <div className="fx-layer orbs" />
      <canvas id="particles" />

      <div className="auth-stage">
        <div
          ref={cardRef}
          className="auth-card cinematic"
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
        >

          <h1 className="logo">HireSense AI</h1>

          <p className="subtitle">
            {mode === "login"
              ? "Intelligent Resume Screening Platform"
              : "Create your HireSense account"}
          </p>

          {error && <p className="auth-error">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="auth-btn"
            disabled={loading}
            onClick={submit}
          >
            {loading
              ? "Processing…"
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </button>

          <div
            className="switch"
            onClick={() =>
              setMode(mode === "login" ? "register" : "login")
            }
          >
            {mode === "login"
              ? "Create account →"
              : "← Back to login"}
          </div>

        </div>
      </div>
    </div>
  );
}
