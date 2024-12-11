const express = require('express');
const router = express.Router();
const ScheduleTest = require('../models/scheduletest-model');
const Subject = require('../models/subject-model');
const User = require('../models/user-model') // Assuming this is the Subject model

router.post('/', async (req, res) => {
  try {
    console.log('Request body:', req.body); // Log the request data

    const { userId, selectedCourse, selectedSubject, questionSet, testDate, testTime, testStatus } = req.body;

    // Validate the input data
    if (!userId || !selectedCourse || !selectedSubject || !questionSet || !testDate || !testTime) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Find the Subject ID using the name
    const subject = await Subject.findOne({ _id: selectedSubject });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    console.log('Found subject:', subject);

    // Save test schedule to the database
    const newTest = new ScheduleTest({
      userId,
      selectedCourse,
      selectedSubject: subject._id,
      questionSet,
      testDate,
      testTime,
      testStatus,
    });

    await newTest.save();
    res.status(201).json(newTest);
  } catch (error) {
    console.error('Error scheduling test:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// GET /api/scheduleTest/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params; // Extract userId from URL

  try {
    // Fetch all scheduled tests for the user
    const scheduledTests = await ScheduleTest.find({ userId });

    if (!scheduledTests || scheduledTests.length === 0) {
      return res.status(404).json({ message: 'No scheduled tests found for this user.' });
    }

    res.status(200).json(scheduledTests); // Return the list of tests
  } catch (error) {
    console.error('Error fetching scheduled tests:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Fetch scheduled tests for a specific user
router.get('/scheduleTest/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId); // Find user by userId
    if (!user) return res.status(404).json({ message: 'User not found' });

    const scheduledTests = await ScheduleTest.find({ userId }); // Find scheduled tests for the user
    res.json(scheduledTests);
  } catch (error) {
    console.error('Error fetching scheduled tests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Route to get ScheduleTest by userId, selectedCourse, and selectedSubject
router.get("/", async (req, res) => {
  const { userId, selectedCourse, selectedSubject } = req.query;

  if (!userId || !selectedCourse || !selectedSubject) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    const scheduleTest = await ScheduleTest.findOne({
      userId,
      selectedCourse,
      selectedSubject,
    });

    if (!scheduleTest) {
      return res.status(404).json({ message: "ScheduleTest not found" });
    }

    res.json({ questionSet: scheduleTest.questionSet });
  } catch (error) {
    console.error("Error fetching schedule test:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint to update test status to "Completed"
// Endpoint to update test status to "Completed" and set the score
router.post('/updateTestStatus', async (req, res) => {
  const { userId, selectedCourse, selectedSubject, score } = req.body;

  console.log('Received request to update test status and score:', req.body);

  try {
    // Find the test schedule with status "Scheduled" and update it
    const updatedTest = await ScheduleTest.findOneAndUpdate(
      { userId, selectedCourse, selectedSubject, testStatus: 'Scheduled' }, // Match tests that are still "Scheduled"
      {
        testStatus: 'Completed',  // Update the test status
      },
      { new: true }  // Return the updated test document
    );

    if (!updatedTest) {
      console.log('Test schedule not found or already completed for:', { userId, selectedCourse, selectedSubject });
      return res.status(404).json({ message: 'Test schedule not found or already completed.' });
    }

    console.log('Test status and score updated:', updatedTest);
    res.status(200).json({ message: 'Test status updated to Completed and score saved.', test: updatedTest });
  } catch (error) {
    console.error('Error updating test status and score:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Endpoint to update test score
router.post('/updateTestScore', async (req, res) => {
  const { userId, selectedCourse, selectedSubject, score } = req.body;

  try {
    // Find the test and update the score
    const result = await ScheduleTest.findOneAndUpdate(
      {
        userId,
        selectedCourse,
        selectedSubject,
      },
      { $set: { score, testStatus: 'Completed' } }, // Update score and mark the test as completed
      { new: true, upsert: false } // Return updated document, do not create if not found
    );

    if (!result) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    res.status(200).json({ message: 'Score updated successfully.', data: result });
  } catch (error) {
    console.error('Error updating test score:', error);
    res.status(500).json({ message: 'Failed to update test score.' });
  }
});
// Fetch completed tests for a specific user
router.get('/api/scheduleTest/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const completedTests = await ScheduleTest.find({ userId, testStatus: 'Completed' })
      .populate('selectedCourse selectedSubject') // Populate course and subject data
      .exec();
    
    res.json(completedTests);
  } catch (error) {
    console.error('Error fetching completed tests:', error);
    res.status(500).send('Server Error');
  }
});
router.put('/scheduleTest', async (req, res) => {
  const { userId, selectedCourse, selectedSubject, testDate, testTime } = req.body;
  
  try {
    const updatedTest = await ScheduleTest.findOneAndUpdate(
      { userId, selectedCourse, selectedSubject, testStatus: 'Scheduled' },
      { $set: { testDate, testTime, testStatus: 'Scheduled' } },
      { new: true }
    );

    if (!updatedTest) {
      return res.status(404).json({ message: 'Test not found or already updated.' });
    }

    res.status(200).json(updatedTest);
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ message: 'Error updating test', error });
  }
});
router.put('/', async (req, res) => {
  console.log("Received PUT request for /scheduleTest");
  const { userId, selectedCourse, selectedSubject, testDate, testTime } = req.body;

  try {
    const updatedTest = await ScheduleTest.findOneAndUpdate(
      { userId, selectedCourse, selectedSubject, testStatus: 'Scheduled' },
      { $set: { testDate, testTime, testStatus: 'Scheduled' } },
      { new: true }
    );

    if (!updatedTest) {
      return res.status(404).json({ message: 'Test not found or already updated.' });
    }

    res.status(200).json(updatedTest);
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ message: 'Error updating test', error });
  }
});



module.exports = router;