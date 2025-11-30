import React, { useState } from "react";
import "./Register.css";

const API_BASE = "http://localhost:5000/api";

function Register({ onSuccess, goToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      onSuccess(data.user);
    } catch (err) {
      console.error(err);
      setError("Network error");
    }
  };

  return (
    <div className="auth-card">
      <div className="brand-badge">NutriTrack</div>
      <h1 className="auth-title">Create your account ✨</h1>
      <p className="auth-subtitle">
        We’ll personalise your diet plan based on your profile.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label">
          Name
          <input
            type="text"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Hima"
          />
        </label>

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
          Sign up
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{" "}
        <button type="button" className="link-btn" onClick={goToLogin}>
          Login
        </button>
      </p>
    </div>
  );
}

export default Register;
