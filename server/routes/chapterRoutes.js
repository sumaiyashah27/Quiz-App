const express = require('express');
const multer = require('multer');
const Chapter = require('../models/chapter-model');
const Question = require('../models/question-model');
const router = express.Router(); // Initialize the router
const upload = multer(); // For handling file uploads
const csv = require('csv-parser');
const stream = require('stream');

// Add Chapter
router.post('/add', async (req, res) => {
  const { name } = req.body;
  try {
    const newChapter = await Chapter.create({ name, questions: [] });
    res.status(201).json(newChapter); // Send back the new chapter
  } catch (error) {
    console.error('Error adding chapter:', error);
    res.status(500).json({ message: 'Failed to add chapter' });
  }
});

// Edit Chapter
router.put('/:id/edit', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedChapter = await Chapter.findByIdAndUpdate(id, { name }, { new: true });
    if (!updatedChapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    res.status(200).json({ message: 'Chapter updated successfully', chapter: updatedChapter });
  } catch (error) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ message: 'Failed to update chapter' });
  }
});

// Delete Chapter
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedChapter = await Chapter.findByIdAndDelete(id);
    if (!deletedChapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    res.status(200).json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({ message: 'Failed to delete chapter' });
  }
});

// Fetch All Chapters with Questions
router.get('/', async (req, res) => {
  try {
    const chapters = await Chapter.find().populate('questions'); // Populate Question details
    res.status(200).json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ message: 'Failed to fetch chapters' });
  }
});

// Upload Questions
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const questionsData = [];
  const csvStream = new stream.Readable();
  csvStream.push(req.file.buffer.toString());
  csvStream.push(null);

  csvStream
    .pipe(csv())
    .on('data', (row) => {
      const { question, questionImage, a, b, c, d, correctAns, answerDescription } = row;
      questionsData.push({
        chapterId: id,
        question: question?.trim(),
        questionImage: questionImage?.trim() || null,
        options: { a: a?.trim(), b: b?.trim(), c: c?.trim(), d: d?.trim() },
        correctAns: correctAns?.trim(),
        answerDescription: answerDescription?.trim() || '',
      });
    })
    .on('end', async () => {
      try {
        const insertedQuestions = await Question.insertMany(questionsData);
        const questionIds = insertedQuestions.map((q) => q._id);
        await Chapter.findByIdAndUpdate(
          id,
          { $push: { questions: { $each: questionIds } } },
          { new: true }
        );
        res.status(200).json({ message: 'Questions uploaded successfully', insertedQuestions });
      } catch (error) {
        console.error('Error inserting questions:', error);
        res.status(500).json({ message: 'Failed to upload questions', error: error.message });
      }
    })
    .on('error', (error) => {
      console.error('Error parsing CSV:', error);
      res.status(500).json({ message: 'Failed to process CSV', error: error.message });
    });
});

// Update Question
router.put('/:subjectId/questions/:questionId', async (req, res) => {
  const { chapterId, questionId } = req.params;
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

// Fetch chapters for a specific subject
router.get('/chapters/:subjectId', async (req, res) => {
  const { subjectId } = req.params;

  try {
    const chapters = await Chapter.find({ subjectId }); // Fetch chapters based on the subject
    if (!chapters) return res.status(404).json({ message: 'Chapters not found' });

    res.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch chapters for a specific subject
router.get('/chapters/:subjectId', async (req, res) => {
  const { subjectId } = req.params;

  try {
    // Find chapters where the subjectId matches
    const chapters = await Chapter.find({ subjectId });

    if (!chapters || chapters.length === 0) {
      return res.status(404).json({ message: 'Chapters not found' });
    }

    res.status(200).json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fetch questions for a specific chapter
router.get('/questions/:subjectId', async (req, res) => {
  const { subjectId } = req.params;

  try {
    const questions = await Question.find({ subjectId }); // Find questions for the chapter
    if (!questions) return res.status(404).json({ message: 'Questions not found' });

    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;