import { useState } from "react";
import "./App.css";

export default function Register({ onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    const res = await fetch("http://127.0.0.1:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      alert("Account created 🔥 Login now!");
      onBack();
    } else {
      alert(data.detail || "Register failed");
    }
  };

  return (
    <div className="auth-wrapper">

      <div className="auth-card cinematic">

        <h1 className="logo">Create Account</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={register}>
          Register
        </button>

        <div className="switch" onClick={onBack}>
          ← Back to login
        </div>

      </div>
    </div>
  );
}
