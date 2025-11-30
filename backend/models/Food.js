// backend/models/Food.js
const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    email: { type: String, required: true }, // user email
    date: { type: String, required: true }, // YYYY-MM-DD
    meal: { type: String, required: true }, // Breakfast/Lunch/...
    name: String,
    unit: String,
    quantity: Number,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
