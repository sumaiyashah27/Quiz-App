const express = require('express');
const Question = require('../models/question-model'); // Initialize the router
const Subject = require('../models/subject-model');
const csv = require('csv-parser');
const stream = require('stream');
const path = require('path');
const multer = require('multer');

const router = express.Router();
// Set up storage configuration
const storage = multer.memoryStorage();  // Use memory storage for in-memory file handling
const upload = multer({ storage: storage });  


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
  
  router.post("/:id/upload", upload.single('file'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const questionsData = [];
    const csvStream = new stream.Readable();
    csvStream.push(req.file.buffer.toString());
    csvStream.push(null);
    csvStream
      .pipe(csv())
      .on("data", (row) => {
        const { question, questionImage, a, b, c, d, correctAns, answerDescription } = row;
        // Validation: Check if required fields exist
        if (!question || !correctAns || !a || !b || !c || !d) {
          console.error("Invalid row data:", row); // Log the invalid row
          return; // Skip invalid row
        }
        questionsData.push({ subjectId: id, question: question?.trim(), questionImage: questionImage?.trim() || null, options: { a: a?.trim(), b: b?.trim(), c: c?.trim(), d: d?.trim() }, correctAns: correctAns?.trim(), answerDescription: answerDescription?.trim() || "", });
      })
      .on("end", async () => {
        if (questionsData.length === 0) {
          return res.status(400).json({ message: "No valid questions found in the file." });
        }
        try {
          const insertedQuestions = await Question.insertMany(questionsData);
          const questionIds = insertedQuestions.map((q) => q._id);
          await Subject.findByIdAndUpdate(
            id,
            { $push: { questions: { $each: questionIds } } },
            { new: true }
          );
          res.status(200).json({ message: "Questions uploaded successfully", insertedQuestions });
        } catch (error) {
          console.error("Error inserting questions:", error);
          res.status(500).json({ message: "Failed to upload questions", error: error.message });
        }
      })
      .on("error", (error) => {
        console.error("Error parsing CSV:", error);
        res.status(500).json({ message: "Failed to process CSV", error: error.message });
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

// Route to fetch questions for a subject
router.get('/subjects/:subjectId/questions', async (req, res) => {
  const { subjectId } = req.params;  // Ensure subjectId is a valid ObjectId
  
  try {
    // Ensure subjectId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ error: 'Invalid subjectId' });
    }

    // Fetch subject by subjectId
    const subject = await Subject.findById(subjectId).populate('questions');
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject.questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching questions' });
  }
});


// Add a new question for a subject (with image upload)
router.post('/:subjectId/questions', async (req, res) => {
  console.log("Request received for subjectId:", req.params.subjectId);
  console.log("Request body:", req.body);

  const { subjectId } = req.params;
  const { question, options, correctAns, answerDescription } = req.body;

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    console.log("Subject found:", subject);

    const newQuestion = new Question({
      question,
      options,
      correctAns,
      answerDescription,
      subject: subjectId,
    });

    await newQuestion.save();
    subject.questions.push(newQuestion._id);
    await subject.save();

    console.log("Question added successfully:", newQuestion);

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




module.exports = router;