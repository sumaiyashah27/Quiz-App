const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number, // Define price as a number
    required: true, // Make it mandatory
    min: 0, // Ensure price is non-negative
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question', // Reference to the Question schema
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);