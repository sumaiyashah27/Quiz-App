const express = require('express');
const Question = require('../models/question-model'); // Initialize the router
const path = require('path');
const multer = require('multer');

const router = express.Router();

// Add a new question for a subject (with image upload)
// Add a new question
router.post('/add-question', async (req, res) => {
  const { questionParts, options, correctAns, answerParts, subjectId } = req.body;

  try {
    const newQuestion = await Question.create({
      question: questionParts.map((part) => ({
        type: part.type,
        value: part.value,
      })),
      options,
      correctAns,
      answerDescription: answerParts.map((part) => ({
        type: part.type,
        value: part.value,
      })),
      subject: subjectId,
    });

    res.status(201).json({ message: 'Question added successfully', question: newQuestion });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;