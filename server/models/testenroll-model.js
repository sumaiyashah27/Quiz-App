const mongoose = require("mongoose");

const testEnrollSchema  = new mongoose.Schema({
  userId: { type: String, required: true },
  selectedCourse: { type: String, required: true },
  selectedSubject: { type: [String], required: true }, // Array of subject IDs
  paymentStatus: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  paymentId: { type: String, required: false }, // Payment ID for successful payments
  amount: { type: Number, required: true },
  order_id: { type: String, required: true }, // Store order ID
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TestEnroll", testEnrollSchema );
