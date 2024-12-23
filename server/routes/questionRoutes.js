const express = require('express');
const Question = require('../models/question-model');
const router = express.Router();

router.post('/', async (req, res) => {
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
