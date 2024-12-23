const express = require('express');
const Question = require('../models/question-model'); // Initialize the router
const path = require('path');
const multer = require('multer');

const router = express.Router();

// Add a new question for a subject (with image upload)
router.post('/questions', async (req, res) => {
  console.log("Request received for subjectId:", req.params.subjectId);
  const { subjectId } = req.params;
  const { question, options, correctAns, answerDescription } = req.body;

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const newQuestion = new Question({
      question,
      options,
      correctAns,
      answerDescription,
      subject: subjectId,
    });

    await newQuestion.save();

    subject.questions.push(newQuestion._id); // Add the question to the subject
    await subject.save();

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;