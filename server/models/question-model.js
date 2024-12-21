const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  question: [{
    type: { type: String, required: true },  // 'text', 'image', or 'table'
    value: { type: Schema.Types.Mixed, required: true } // 'text' content, 'image' URL, or 'table' object
  }],
  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true }
  },
  correctAns: {
    type: String,
    required: true,
    validate: {
      validator: (v) => ['a', 'b', 'c', 'd'].includes(v),
      message: 'Correct answer must be one of a, b, c, or d',
    }
  },
  answerDescription: [{
    type: { type: String, required: true },  // 'text', 'image', or 'table'
    value: { type: Schema.Types.Mixed, required: true } // 'text' content, 'image' URL, or 'table' object
  }],
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true }
}, { timestamps: true }); // Optional: Add timestamps for createdAt and updatedAt

questionSchema.index({ subjectId: 1 }); // Index for performance improvement

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
