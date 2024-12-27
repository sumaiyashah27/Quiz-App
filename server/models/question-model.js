const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  // First set of question fields
  questionText1: { type: String },
  questionImage1: { type: String },  // URL or file path to image
  questionTable1: { type: mongoose.Schema.Types.Mixed },  // Can store tables as objects or arrays

  // Second set of question fields
  questionText2: { type: String },
  questionImage2: { type: String },
  questionTable2: { type: mongoose.Schema.Types.Mixed },

  // Third set of question fields
  questionText3: { type: String },
  questionImage3: { type: String },
  questionTable3: { type: mongoose.Schema.Types.Mixed },

  // Multiple choice options
  options: {
    a: { type: String },
    b: { type: String },
    c: { type: String },
    d: { type: String },
  },

  // Correct answer choice (a, b, c, or d)
  correctAns: { type: String },

  // First set of answer description fields
  answerDescriptionText1: { type: String },
  answerDescriptionImage1: { type: String },  // URL or file path to image
  answerDescriptionTable1: { type: mongoose.Schema.Types.Mixed },

  // Second set of answer description fields
  answerDescriptionText2: { type: String },
  answerDescriptionImage2: { type: String },
  answerDescriptionTable2: { type: mongoose.Schema.Types.Mixed },

  // Third set of answer description fields
  answerDescriptionText3: { type: String },
  answerDescriptionImage3: { type: String },
  answerDescriptionTable3: { type: mongoose.Schema.Types.Mixed },

  // Reference to the subject model (for linking to a specific subject)
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
});

module.exports = mongoose.model('Question', QuestionSchema);