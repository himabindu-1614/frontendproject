// src/App.jsx
import React, { useState } from "react";
import "./App.css";

import LoginPage from "./components/LoginPage.jsx";
import Register from "./components/Register.jsx";
import UserForm from "./components/UserForm.jsx";
import Dashboard from "./components/Dashboard.jsx";

const API_BASE = "http://localhost:5000/api";

function App() {
  const [view, setView] = useState("login"); // login | register | form | dashboard
  const [user, setUser] = useState(null); // {name,email}
  const [profile, setProfile] = useState(null);

  const handleLogin = (userData, profileData) => {
    setUser(userData);
    if (profileData) {
      setProfile(profileData);
      setView("dashboard");
    } else {
      setView("form");
    }
  };

  const handleProfileSubmit = async (profileData) => {
    if (!user) return;
    setProfile(profileData);

    // save to backend
    try {
      await fetch(`${API_BASE}/profile/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, profile: profileData }),
      });
    } catch (err) {
      console.error("profile save error", err);
    }

    setView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    setView("login");
  };

  return (
    <div className="app-root">
      {view === "login" && (
        <div className="auth-layout">
          <LoginPage
            onSuccess={handleLogin}
            goToRegister={() => setView("register")}
          />
        </div>
      )}

      {view === "register" && (
        <div className="auth-layout">
          <Register
            onSuccess={(u) => {
              setUser(u);
              setView("form");
            }}
            goToLogin={() => setView("login")}
          />
        </div>
      )}

      {view === "form" && (
        <div className="auth-layout">
          <UserForm user={user} onSubmit={handleProfileSubmit} />
        </div>
      )}

      {view === "dashboard" && (
        <Dashboard user={user} profile={profile} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
