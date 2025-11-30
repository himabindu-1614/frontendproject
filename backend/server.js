// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Mongo connection (LOCAL)
mongoose
  .connect("mongodb://127.0.0.1:27017/nutri", {
    // options not needed in latest mongoose but safe
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

// --------- MODELS ----------
const User = require("./models/User");
const Food = require("./models/Food");

// --------- AUTH ROUTES ----------

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password, // NOTE: plain text – not for production
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("register error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      profile: user.profile || null,
    });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --------- PROFILE ROUTES ----------

// Save / update profile (age, height, goal, deficiencies...)
app.post("/api/profile/save", async (req, res) => {
  try {
    const { email, profile } = req.body;
    if (!email || !profile) {
      return res.status(400).json({ message: "Email + profile required" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { profile },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ profile: user.profile });
  } catch (err) {
    console.error("profile save error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --------- FOOD ROUTES ----------

// Add food entry
app.post("/api/food/add", async (req, res) => {
  try {
    const entry = await Food.create(req.body);
    res.status(201).json({ entry });
  } catch (err) {
    console.error("food add error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get today's food for user
app.get("/api/food/today", async (req, res) => {
  try {
    const { email, date } = req.query;
    if (!email || !date)
      return res
        .status(400)
        .json({ message: "email and date query params required" });

    const entries = await Food.find({ email, date }).sort({ createdAt: 1 });
    res.json({ entries });
  } catch (err) {
    console.error("food today error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete entry
app.delete("/api/food/:id", async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("food delete error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --------- START SERVER ----------
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 API server running on http://localhost:${PORT}`)
);
