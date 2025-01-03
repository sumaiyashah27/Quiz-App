const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText1: { type: String },
  questionImage1: { type: String },  // URL or file path to image
  questionTable1: { type: mongoose.Schema.Types.Mixed },  // Can store tables as objects or arrays

  
  questionText2: { type: String },
  questionImage2: { type: String },
  questionTable2: { type: mongoose.Schema.Types.Mixed },

  
  questionText3: { type: String },
  questionImage3: { type: String },
  questionTable3: { type: mongoose.Schema.Types.Mixed },
  
  options: {
    a: { type: String },
    b: { type: String },
    c: { type: String },
    d: { type: String },
  },
  
  correctAns: { type: String },
  
  answerDescriptionText1: { type: String },
  answerDescriptionImage1: { type: String },  // URL or file path to image
  answerDescriptionTable1: { type: mongoose.Schema.Types.Mixed },

  
  answerDescriptionText2: { type: String },
  answerDescriptionImage2: { type: String },
  answerDescriptionTable2: { type: mongoose.Schema.Types.Mixed },


  answerDescriptionText3: { type: String },
  answerDescriptionImage3: { type: String },
  answerDescriptionTable3: { type: mongoose.Schema.Types.Mixed },

  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true}
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
