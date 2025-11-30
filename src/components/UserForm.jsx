import React, { useState } from "react";
import "./UserForm.css";

function UserForm({ user, onSubmit }) {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("female");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goal, setGoal] = useState("maintain");
  const [deficiencies, setDeficiencies] = useState([]);

  const toggleDef = (d) => {
    setDeficiencies((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      activityLevel,
      goal,
      deficiencies,
    });
  };

  const deficiencyOptions = ["Iron", "Calcium", "Vitamin D", "B12"];

  return (
    <div className="auth-card wider">
      <h1 className="auth-title">Hi {user?.name || "Hima"} 👋</h1>
      <p className="auth-subtitle">
        Tell us about your body so we can calculate BMI, macros and diet tips.
      </p>

      <form className="auth-form two-column" onSubmit={handleSubmit}>
        <label className="auth-label">
          Age
          <input
            type="number"
            className="auth-input"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </label>

        <label className="auth-label">
          Gender
          <select
            className="auth-input"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="auth-label">
          Height (cm)
          <input
            type="number"
            className="auth-input"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required
          />
        </label>

        <label className="auth-label">
          Weight (kg)
          <input
            type="number"
            className="auth-input"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </label>

        <label className="auth-label">
          Activity level
          <select
            className="auth-input"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Lightly active</option>
            <option value="moderate">Moderately active</option>
            <option value="high">Very active</option>
          </select>
        </label>

        <label className="auth-label">
          Goal
          <select
            className="auth-input"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          >
            <option value="lose">Lose weight</option>
            <option value="maintain">Maintain weight</option>
            <option value="gain">Gain weight</option>
          </select>
        </label>

        <div className="auth-label full-width">
          Suspected deficiencies
          <div className="chip-row">
            {deficiencyOptions.map((d) => (
              <button
                type="button"
                key={d}
                className={
                  deficiencies.includes(d) ? "chip chip-active" : "chip"
                }
                onClick={() => toggleDef(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="primary-btn full-width-btn">
          Generate my dashboard →
        </button>
      </form>
    </div>
  );
}

export default UserForm;
