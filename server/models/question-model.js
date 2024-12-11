const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  questionImage: {
    type: String, // URL or file path for the image
  },
  options: { 
    type: Map, 
    of: String, // The options will be a map with keys 'a', 'b', 'c', 'd' and their respective answer strings
    required: true 
  },
  correctAns: { 
    type: String, 
    required: true, 
  },
  answerDescription: {
    type: String,
    required: false, // Optional field for explaining the answer
  },
  subjectId: { // Updated field name to reference Subject instead of Chapter
    type: mongoose.Schema.Types.ObjectId, // Assuming subjectId is an ObjectId from the Subject collection
    ref: 'Subject', // Replace with the actual model name of the Subject collection
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
