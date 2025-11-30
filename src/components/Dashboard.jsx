import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const API_BASE = "http://localhost:5000/api";

/* ---------- Helpers ---------- */

function calculateBMI(weight, heightCm) {
  const h = heightCm / 100;
  if (!h || !weight) return null;
  const bmi = weight / (h * h);
  let status = "Normal";
  if (bmi < 18.5) status = "Underweight";
  else if (bmi >= 25 && bmi < 30) status = "Overweight";
  else if (bmi >= 30) status = "Obese";
  return { bmi: bmi.toFixed(1), status };
}

function calculateCalories({ gender, age, height, weight, activityLevel, goal }) {
  let bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const factorMap = { sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725 };
  let tdee = bmr * (factorMap[activityLevel] || 1.2);
  if (goal === "lose") tdee -= 300;
  if (goal === "gain") tdee += 300;
  return { bmr: Math.round(bmr), tdee: Math.round(tdee) };
}

function getMacroBreakdown(goal, totalCalories) {
  let proteinPct = 0.3,
    carbPct = 0.45,
    fatPct = 0.25;
  if (goal === "lose") {
    proteinPct = 0.35;
    carbPct = 0.4;
  } else if (goal === "gain") {
    proteinPct = 0.3;
    carbPct = 0.5;
    fatPct = 0.2;
  }
  return {
    macrosPie: [
      { name: "Protein", value: Math.round(totalCalories * proteinPct) },
      { name: "Carbs", value: Math.round(totalCalories * carbPct) },
      { name: "Fats", value: Math.round(totalCalories * fatPct) },
    ],
    macroGrams: {
      protein: Math.round((totalCalories * proteinPct) / 4),
      carbs: Math.round((totalCalories * carbPct) / 4),
      fats: Math.round((totalCalories * fatPct) / 9),
    },
  };
}

/* ---------- Food options ---------- */

const FOOD_OPTIONS = [
  { id: "egg", name: "Egg", unit: "1", calories: 70, protein: 6, carbs: 1, fats: 5 },
  { id: "rice", name: "Rice (1 cup)", unit: "1 cup", calories: 210, protein: 4, carbs: 45, fats: 1 },
  { id: "chapati", name: "Chapati", unit: "1", calories: 120, protein: 3, carbs: 18, fats: 3 },
  { id: "paneer", name: "Paneer (100g)", unit: "100g", calories: 296, protein: 18, carbs: 8, fats: 22 },
  { id: "banana", name: "Banana", unit: "1", calories: 89, protein: 1, carbs: 23, fats: 0 },
];

function AddFoodModal({ isOpen, onClose, onAdd }) {
  const [meal, setMeal] = useState("Breakfast");
  const [foodId, setFoodId] = useState("egg");
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const food = FOOD_OPTIONS.find((f) => f.id === foodId);
    if (!food) return;
    onAdd({
      meal,
      name: food.name,
      unit: food.unit,
      quantity,
      calories: food.calories * quantity,
      protein: food.protein * quantity,
      carbs: food.carbs * quantity,
      fats: food.fats * quantity,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card pastel-modal">
        <h3>Add food 🍽️</h3>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-label">
            Meal
            <select
              className="modal-input"
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snacks</option>
            </select>
          </label>

          <label className="modal-label">
            Food
            <select
              className="modal-input"
              value={foodId}
              onChange={(e) => setFoodId(e.target.value)}
            >
              {FOOD_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>

          <label className="modal-label">
            Quantity
            <input
              type="number"
              min="1"
              className="modal-input"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn small">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const COLORS = ["#22c55e", "#60a5fa", "#fb7185"];

function Dashboard({ user, profile, onLogout }) {
  const {
    age,
    gender,
    height,
    weight,
    activityLevel,
    goal,
    deficiencies = [],
  } = profile || {};

  const bmiInfo = calculateBMI(weight, height);
  const calInfo = calculateCalories({
    gender,
    age,
    height,
    weight,
    activityLevel,
    goal,
  });
  const { macrosPie, macroGrams } = getMacroBreakdown(
    goal,
    calInfo.tdee || 1800
  );

  const [foodLog, setFoodLog] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load today's food from backend
  useEffect(() => {
    if (!user?.email) return;
    const today = new Date().toISOString().slice(0, 10);

    fetch(
      `${API_BASE}/food/today?email=${encodeURIComponent(
        user.email
      )}&date=${today}`
    )
      .then((res) => res.json())
      .then((data) => {
        const entries = (data.entries || []).map((e) => ({
          ...e,
          id: e._id,
        }));
        setFoodLog(entries);
      })
      .catch((err) => console.error("load food error", err));
  }, [user]);

  // Add food
  const handleAddFood = async (entry) => {
    const today = new Date().toISOString().slice(0, 10);
    const payload = {
      email: user?.email || "demo@test.com",
      date: today,
      ...entry,
    };

    try {
      const res = await fetch(`${API_BASE}/food/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setFoodLog((prev) => [...prev, { ...data.entry, id: data.entry._id }]);
    } catch (err) {
      console.error("add food error", err);
    }
  };

  // Remove food
  const handleRemove = async (id) => {
    setFoodLog((prev) => prev.filter((f) => f.id !== id));
    try {
      await fetch(`${API_BASE}/food/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("delete food error", err);
    }
  };

  // Totals
  const totals = foodLog.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fats += item.fats;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const meals = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  const calorieProgress =
    calInfo.tdee > 0
      ? Math.min(100, Math.round((totals.calories / calInfo.tdee) * 100))
      : 0;

  // fake week trend just for cute chart
  const weekTrend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (day, i) => ({
      day,
      calories:
        i === new Date().getDay() - 1
          ? totals.calories
          : Math.round(calInfo.tdee * (0.7 + Math.random() * 0.4)),
      target: calInfo.tdee,
    })
  );

  let healthTip = "Log all your meals to see accurate insights 🌸";
  if (totals.calories > calInfo.tdee + 200) {
    healthTip = "You’re above your calorie target today. Try a lighter dinner 💧";
  } else if (totals.calories < calInfo.tdee - 200) {
    healthTip = "You’re under your target — add a healthy snack like fruits 🥝";
  } else if (totals.calories > 0) {
    healthTip = "Nice! You’re close to your calorie goal for today 💚";
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <p className="app-tag">NutriTrack · pastel wellness</p>
            <h1 className="dash-title">
              Hey {user?.name?.split(" ")[0] || "Hima"} 🌱
            </h1>
            <p className="dash-subtitle">Let’s nourish your body today.</p>
          </div>
          <div className="header-right">
            <div className="avatar-pill">
              <span className="avatar-emoji">🥗</span>
              <span className="avatar-name">
                {user?.name || "Guest"}
              </span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Food Intake */}
        <section className="card food-section">
          <div className="food-header-row">
            <div>
              <h2 className="section-title">Food Intake · Today</h2>
              <p className="section-sub">
                Calories: {totals.calories} / {calInfo.tdee} kcal
              </p>
            </div>
            <button
              className="primary-btn"
              type="button"
              onClick={() => setIsModalOpen(true)}
            >
              + Add Food
            </button>
          </div>

          <div className="calorie-progress-row">
            <div className="calorie-ring">
              <div className="ring-outer">
                <div
                  className="ring-inner"
                  style={{ "--progress": `${calorieProgress}%` }}
                >
                  <span className="ring-number">{calorieProgress}%</span>
                </div>
              </div>
              <span className="ring-label">Calorie goal filled</span>
            </div>

            <div className="macro-mini">
              <span>Protein: {totals.protein} g</span>
              <span>Carbs: {totals.carbs} g</span>
              <span>Fats: {totals.fats} g</span>
            </div>
          </div>

          <div className="meal-list-wrapper">
            {meals.map((meal) => {
              const list = foodLog.filter((f) => f.meal === meal);
              const totalMealCalories = list.reduce(
                (acc, item) => acc + item.calories,
                0
              );
              const iconMap = {
                Breakfast: "🌤️",
                Lunch: "🌞",
                Dinner: "🌙",
                Snacks: "🍪",
              };

              return (
                <div key={meal} className="meal-column">
                  <div className="meal-header">
                    <span className="meal-name">
                      {iconMap[meal]} {meal}
                    </span>
                    <span className="meal-kcal">
                      {totalMealCalories || 0} kcal
                    </span>
                  </div>

                  {list.length === 0 ? (
                    <p className="meal-empty">No items</p>
                  ) : (
                    <ul className="meal-list">
                      {list.map((item) => (
                        <li key={item.id} className="meal-item">
                          <div className="meal-item-main">
                            <span className="meal-item-name">{item.name}</span>
                            <span className="meal-item-qty">
                              {item.quantity} × {item.unit}
                            </span>
                          </div>
                          <div className="meal-item-macros">
                            <span>{item.calories} kcal</span>
                            <span>P {item.protein}g</span>
                            <span>C {item.carbs}g</span>
                            <span>F {item.fats}g</span>
                          </div>
                          <button
                            className="remove-pill"
                            onClick={() => handleRemove(item.id)}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Lower grid: BMI, charts, tips */}
        <section className="dashboard-grid">
          {/* BMI card */}
          <div className="dash-card highlight">
            <h3 className="card-title">BMI</h3>
            {bmiInfo ? (
              <div className="bmi-row">
                <div className="bmi-number">
                  {bmiInfo.bmi}
                  <span>{bmiInfo.status}</span>
                </div>
                <div className="bmi-details">
                  <p className="bmi-status">
                    Height {height} cm · Weight {weight} kg
                  </p>
                  <p className="bmi-text">
                    Aiming to <strong>{goal}</strong> with{" "}
                    <strong>{activityLevel}</strong> activity.
                  </p>
                </div>
              </div>
            ) : (
              <p className="bmi-text">Fill your profile to see BMI.</p>
            )}
          </div>

          {/* Daily calories / macro targets */}
          <div className="dash-card">
            <h3 className="card-title">Daily calories & goal</h3>
            <div className="calorie-row">
              <div>
                <p className="label">TDEE</p>
                <p className="value accent">{calInfo.tdee} kcal</p>
              </div>
              <div>
                <p className="label">Today logged</p>
                <p className="value">{totals.calories} kcal</p>
              </div>
              <div>
                <p className="label">Goal</p>
                <p className="value small">{goal || "-"}</p>
              </div>
            </div>
            <p className="hint-text">{healthTip}</p>
          </div>

          {/* Target macro pie */}
          <div className="dash-card chart-card">
            <h3 className="card-title">Macro split (target)</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macrosPie}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={70}
                  >
                    {macrosPie.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="macro-grams">
              <span>Protein: {macroGrams.protein} g</span>
              <span>Carbs: {macroGrams.carbs} g</span>
              <span>Fats: {macroGrams.fats} g</span>
            </div>
          </div>

          {/* Actual macros today */}
          <div className="dash-card chart-card">
            <h3 className="card-title">Macros eaten today</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { label: "Protein", qty: totals.protein },
                    { label: "Carbs", qty: totals.carbs },
                    { label: "Fats", qty: totals.fats },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="qty" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly trend line chart */}
          <div className="dash-card chart-card full-width">
            <h3 className="card-title">Weekly calorie trend</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#9ca3af"
                    strokeDasharray="4 4"
                  />
                  <Line type="monotone" dataKey="calories" stroke="#fb7185" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="hint-text small">
              Pink line shows your approximate calories each day vs grey target.
            </p>
          </div>

          {/* Deficiency tips */}
          <div className="dash-card full-width">
            <h3 className="card-title">Foods for your deficiencies</h3>
            {(!deficiencies || deficiencies.length === 0) && (
              <p className="hint-text">
                You haven’t selected any deficiencies yet. Update your profile
                if you suspect Iron, Calcium, Vitamin D or B12.
              </p>
            )}

            {deficiencies && deficiencies.length > 0 && (
              <div className="def-grid">
                {deficiencies.includes("Iron") && (
                  <div className="def-card iron">
                    <h4>🩸 Iron</h4>
                    <ul>
                      <li>Spinach, methi, drumstick leaves</li>
                      <li>Ragi, jaggery, dates</li>
                      <li>Pair with vitamin C fruits</li>
                    </ul>
                  </div>
                )}
                {deficiencies.includes("Calcium") && (
                  <div className="def-card calcium">
                    <h4>🦴 Calcium</h4>
                    <ul>
                      <li>Milk, curd, paneer</li>
                      <li>Tofu, sesame seeds, ragi</li>
                      <li>Avoid too much cola drinks</li>
                    </ul>
                  </div>
                )}
                {deficiencies.includes("Vitamin D") && (
                  <div className="def-card vitd">
                    <h4>☀️ Vitamin D</h4>
                    <ul>
                      <li>10–20 min morning sunlight</li>
                      <li>Mushrooms, egg yolk</li>
                      <li>Fortified milk and cereals</li>
                    </ul>
                  </div>
                )}
                {deficiencies.includes("B12") && (
                  <div className="def-card b12">
                    <h4>🧠 B12</h4>
                    <ul>
                      <li>Eggs, curd, paneer</li>
                      <li>Fortified cereals</li>
                      <li>Consult doctor for supplements</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <AddFoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddFood}
      />
    </div>
  );
}

export default Dashboard;
