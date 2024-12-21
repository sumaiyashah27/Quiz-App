const express = require('express');
const Question = require('../models/question-model'); // Initialize the router
const path = require('path');
const multer = require('multer');

const router = express.Router();


// Add a new question for a subject (with image upload)
router.post('/questions', async (req, res) => {
  const { subjectId } = req.params; // Get the subjectId from the URL params
  const { question, options, correctAns, answerDescription } = req.body; // Get the data from the request body

  try {
    // Find the subject by subjectId to make sure it exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Create the new question
    const newQuestion = new Question({
      question,
      options,
      correctAns,
      answerDescription,
      subject: subjectId, // Associate the question with the subject
    });

    // Save the question to the database
    await newQuestion.save();

    // Add the question's ID to the subject's questions array
    subject.questions.push(newQuestion._id);
    await subject.save();

    res.status(201).json({ message: 'Question added successfully', question: newQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

module.exports = router;