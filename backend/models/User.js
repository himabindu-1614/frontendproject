// backend/models/User.js
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    activityLevel: String,
    goal: String,
    deficiencies: [String],
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // plain for demo
    profile: profileSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
