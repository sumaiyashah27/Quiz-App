const mongoose = require('mongoose'); 

// Define the ScheduleTest Schema
const scheduleTestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the user in MongoDB
    required: true,
    ref: 'User', // Reference to the User collection
  },
  selectedCourse: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the course in MongoDB
    required: true,
    ref: 'Course', // Reference to the Course collection
  },
  selectedSubject: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the subject in MongoDB
    required: true,
    ref: 'Subject', // Reference to the Subject collection
  },
  questionSet: {
    type: Number, // The number of questions (30, 90, or 120)
    required: true,
  },
  testDate: {
    type: Date, // The date for the test
    required: true,
  },
  testTime: {
    type: String, // The time for the test (in HH:mm format)
    required: true,
  },
  testStatus: {
    type: String, // Status of the test (e.g., "Scheduled", "Completed", "Delayed")
    default: 'Scheduled', // Default status is "Scheduled"
    enum: ['Scheduled', 'Completed', 'Delayed'], // You can define possible values for the status
  },
  score: {
    type: Number, // The score achieved in the test
    default: 0, // Default score is 0
    min: 0, // Score cannot be less than 0
    required: true,
  },
  reminderSent24Hours: {
    type: Boolean, // Flag to indicate if the 24-hour reminder was sent
    default: false, // Default to false (reminder has not been sent)
  },
  reminderSent1Hour: {
    type: Boolean, // Flag to indicate if the 1-hour reminder was sent
    default: false, // Default to false (reminder has not been sent)
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Create the ScheduleTest model
const ScheduleTest = mongoose.model('ScheduleTest', scheduleTestSchema);

module.exports = ScheduleTest;
