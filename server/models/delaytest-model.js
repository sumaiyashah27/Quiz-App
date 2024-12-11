const mongoose = require('mongoose');

// Define the DelayTest schema
const delayTestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  selectedCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  selectedSubject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  testDate: { type: Date, required: true },
  testTime: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true }
});

// Create the DelayTest model
const DelayTest = mongoose.model('DelayTest', delayTestSchema);

module.exports = DelayTest;
