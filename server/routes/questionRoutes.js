// routes/questionRoutes.js
const express = require("express");
const Question = require("../models/question-model");  // Your Question model
const router = express.Router();

// POST route for adding a question
router.post("/", async (req, res) => {
  console.log("Received POST request at /api/questions");  // This will log when the request hits the route

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

    res.status(201).json({ message: "Question added successfully", question: newQuestion });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


module.exports = router;
