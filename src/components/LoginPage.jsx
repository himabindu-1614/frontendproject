import React, { useState } from "react";
import "./LoginPage.css";

const API_BASE = "http://localhost:5000/api";

function LoginPage({ onSuccess, goToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      onSuccess(data.user, data.profile);
    } catch (err) {
      console.error(err);
      setError("Network error");
    }
  };

  return (
    <div className="auth-card">
      <div className="brand-badge">NutriTrack</div>
      <h1 className="auth-title">Welcome back 👋</h1>
      <p className="auth-subtitle">Log in to see your smart diet dashboard.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label">
          Email
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>

        <label className="auth-label">
          Password
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="primary-btn">
          Login
        </button>
      </form>

      <p className="auth-footer">
        New here?{" "}
        <button type="button" className="link-btn" onClick={goToRegister}>
          Create an account
        </button>
      </p>
    </div>
  );
}

export default LoginPage;
