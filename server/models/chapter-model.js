const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Name of the chapter
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question', // Reference to the Question schema
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Chapter', chapterSchema);
