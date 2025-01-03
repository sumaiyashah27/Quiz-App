const express = require('express');
const multer = require('multer');
const Question = require('../models/question-model'); // Initialize the router
const upload = multer(); // For handling file uploads
const csv = require('csv-parser');
const stream = require('stream');
const Subject = require("../models/subject-model");

const router = express.Router();

// Get all subjects with questions
router.get("/", async (req, res) => {
    try {
        const subjects = await Subject.find().populate("questions");
        res.status(200).json(subjects);
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
});
 // Add a new subject
router.post("/", async (req, res) => {
    const { name, price, questions = [] } = req.body; // Removed chapters, now using questions
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }
    try {
      const newSubject = new Subject({ name, price, questions });
      await newSubject.save();
      res.status(201).json(newSubject);
    } catch (error) {
      console.error("Error adding subject:", error);
      res.status(500).json({ message: "Error adding subject", error: error.message });
    }
  });
// Update a subject by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body; // Only update the name field
    try {
      const updatedSubject = await Subject.findByIdAndUpdate(id, { name }, { new: true });
        if (!updatedSubject) {
          return res.status(404).json({ message: "Subject not found" });
        }
        res.status(200).json(updatedSubject);
    } catch (error) {
        console.error("Error updating subject:", error);
        res.status(500).json({ message: "Error updating subject", error: error.message });
    }
});
// Delete a subject by ID
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deletedSubject = await Subject.findByIdAndDelete(id);
        if (!deletedSubject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        res.status(200).json({ message: "Subject deleted" });
    } catch (error) {
        console.error("Error deleting subject:", error);
        res.status(500).json({ message: "Error deleting subject", error: error.message });
    }
});

// Route to fetch a subject by ID
router.get("/:id", async (req, res) => {
    console.log("Subject ID:", req.params.id); // Debugging
    try { const subject = await Subject.findById(req.params.id);
      if (!subject) return res.status(404).json({ message: "Subject not found" });
      res.status(200).json(subject);
    } catch (err) {
      console.error("Error fetching subject:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
  // Upload route for questions CSV file
router.post("/:id/upload", upload.single("file"), async (req, res) => {
  const { id } = req.params; // Get the subject ID from the route parameter

  // Validate uploaded file
  if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
  }

  const questionsData = [];
  const csvStream = new stream.Readable();
  csvStream.push(req.file.buffer.toString());
  csvStream.push(null);

  let isHeaderValid = true;
  let hasValidRow = false;

  // Parse the CSV
  csvStream
      .pipe(csv())
      .on("headers", (headers) => {
          // Validate if the headers match your schema (without 'subject' field in CSV)
          const expectedHeaders = [
              "questionText1", "questionImage1", "questionTable1",
              "questionText2", "questionImage2", "questionTable2",
              "questionText3", "questionImage3", "questionTable3",
              "a", "b", "c", "d", "correctAns",
              "answerDescriptionText1", "answerDescriptionImage1", "answerDescriptionTable1",
              "answerDescriptionText2", "answerDescriptionImage2", "answerDescriptionTable2",
              "answerDescriptionText3", "answerDescriptionImage3", "answerDescriptionTable3"
          ];

          if (
              headers.length !== expectedHeaders.length ||
              !headers.every((h, i) => h.trim() === expectedHeaders[i])
          ) {
              isHeaderValid = false;
          }
      })
      .on("data", (row) => {
          if (!isHeaderValid) return;

          // Skip empty rows
          const isEmptyRow = Object.values(row).every((value) => !value.trim());
          if (!isEmptyRow) {
              hasValidRow = true;

              // Transform CSV row to match the schema, without the 'subject' field from CSV
              const question = {
                questionText1: row.questionText1 || null,
                questionImage1: row.questionImage1 || null,
                questionTable1: row.questionTable1 || null,
              
                questionText2: row.questionText2 || null,
                questionImage2: row.questionImage2 || null,
                questionTable2: row.questionTable2 || null,
              
                questionText3: row.questionText3 || null,
                questionImage3: row.questionImage3 || null,
                questionTable3: row.questionTable3 || null,
              
                options: {
                  a: row.a || null,
                  b: row.b || null,
                  c: row.c || null,
                  d: row.d || null,
                },
                correctAns: row.correctAns || null,
              
                answerDescriptionText1: row.answerDescriptionText1 || null,
                answerDescriptionImage1: row.answerDescriptionImage1 || null,
                answerDescriptionTable1: row.answerDescriptionTable1 || null,
              
                answerDescriptionText2: row.answerDescriptionText2 || null,
                answerDescriptionImage2: row.answerDescriptionImage2 || null,
                answerDescriptionTable2: row.answerDescriptionTable2 || null,
              
                answerDescriptionText3: row.answerDescriptionText3 || null,
                answerDescriptionImage3: row.answerDescriptionImage3 || null,
                answerDescriptionTable3: row.answerDescriptionTable3 || null,
              
                subjectId: id,  // Correctly set to `subjectId` based on the schema
              };              

              questionsData.push(question);
          }
      })
      .on("end", async () => {
          if (!isHeaderValid) {
              return res.status(400).json({
                  message: "Invalid file headers. Please upload a valid CSV file.",
              });
          }

          if (!hasValidRow) {
              return res.status(400).json({
                  message: "No valid rows found in the file.",
              });
          }

          try {
              // Insert questions into the database
              const insertedQuestions = await Question.insertMany(questionsData);

              // Update the subject with new questions
              const questionIds = insertedQuestions.map((q) => q._id);
              await Subject.findByIdAndUpdate(
                  id,
                  { $push: { questions: { $each: questionIds } } },
                  { new: true }
              );

              res.status(200).json({
                  message: "Questions uploaded successfully",
                  insertedQuestions,
              });
          } catch (error) {
              console.error("Error inserting questions:", error);
              res.status(500).json({
                  message: "Failed to upload questions",
                  error: error.message,
              });
          }
      })
      .on("error", (error) => {
          console.error("Error parsing CSV:", error);
          res.status(500).json({
              message: "Failed to process CSV",
              error: error.message,
          });
      });
});
 
// Update question by ID
router.put('/:subjectId/questions/:questionId', async (req, res) => {
  const { subjectId, questionId } = req.params;
  const updatedData = req.body;
  try {
    // Find the question by its ID
    const question = await Question.findByIdAndUpdate(questionId, updatedData, { new: true });
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.status(200).json({ message: 'Question updated successfully', question });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});
// Example of returning an array of questions
router.get("/questions", async (req, res) => {
  const subjectId = req.query.subjectId;

  try {
    // Fetch subject by ID and populate the questions field
    const subject = await Subject.findById(subjectId).populate('questions'); // Populate questions
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    const questions = subject.questions; // Get the populated questions
    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found for the selected subject" });
    }

    console.log('Fetched Questions:', questions); // Debugging to check the fetched questions
    res.status(200).json(questions); // Return the questions
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Error fetching questions", error: error.message });
  }
});

router.get('/:subjectId/questions', async (req, res) => {
  const { subjectId } = req.params;

  try {
    // Find the subject by ID and populate its questions
    const subject = await Subject.findById(subjectId).populate('questions');

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Return the questions of the subject
    res.json(subject.questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;