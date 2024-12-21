const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the question model
const questionSchema = new Schema({
  question: [
    {
      type: { type: String, required: true }, // 'text', 'image', or 'table'
      value: { type: Schema.Types.Mixed, required: true } // Can be text, URL for image, or table data
    }
  ],
  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true }
  },
  correctAns: { type: String, required: true }, // Correct answer (a, b, c, d)
  answerDescription: [
    {
      type: { type: String, required: true }, // 'text', 'image', or 'table'
      value: { type: Schema.Types.Mixed, required: true } // Can be text, URL for image, or table data
    }
  ],
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true } // Reference to subject collection
});

// Create and export the model
const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
