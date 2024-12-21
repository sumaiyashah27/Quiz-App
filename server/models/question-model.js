const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  // The question field can have an array of objects, where each object has a type (text, image, table) and a value (content)
  question: [
    {
      type: { type: String, enum: ['text', 'image', 'table'], required: true }, // Type of the part (text, image, table)
      value: { type: mongoose.Schema.Types.Mixed, required: true }, // The actual content for the part (text, URL for image, table data)
    },
  ],

  // Options for the multiple choice answers (a, b, c, d)
  options: {
    a: { type: String },
    b: { type: String },
    c: { type: String },
    d: { type: String },
  },

  // Correct answer choice (a, b, c, or d)
  correctAns: { type: String },

  // Description for the answer, can also contain text, image, or table types
  answerDescription: [
    {
      type: { type: String, enum: ['text', 'image', 'table'], required: true },
      value: { type: mongoose.Schema.Types.Mixed, required: true },
    },
  ],

  // Reference to the subject model (for linking to a specific subject)
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
});

module.exports = mongoose.model('Question', QuestionSchema);
