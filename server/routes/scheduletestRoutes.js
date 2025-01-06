const express = require('express');
const router = express.Router();
require('dotenv').config();
const nodemailer = require('nodemailer');
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

// Fetch test details for the given user, course, and subject
router.get('/', async (req, res) => {
  const { userMongoId, course, subject } = req.query;
  try {
    const testDetails = await ScheduleTest.findOne({
      userMongoId,
      selectedCourse: course,
      selectedSubject: subject,
    }).populate('selectedCourse selectedSubject'); // Populate course and subject fields
    if (!testDetails) {
      return res.status(404).json({ message: 'Test not found' });
    }
    return res.json({
      questionSet: testDetails.questionSet,
      testDate: testDetails.testDate,
      testTime: testDetails.testTime,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Route to send email
router.post('/send-email', async (req, res) => {
  const { email, subject, message, testDate, testTime } = req.body;

  // Validate received data
  if (!email || !subject || !message || !testDate || !testTime) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Create email transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,  // Your Gmail account
      pass: process.env.GMAIL_PASS,  // Your Gmail app password
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: subject,
    text: `${message} - Test Date: ${new Date(testDate).toLocaleString()} at ${testTime}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email.');
  }
});

// Endpoint to check and update test status to "delay" after 1 hour
router.put('/scheduleTest/delay', async (req, res) => {
  const { userMongoId, selectedCourse, selectedSubject, testDate } = req.body;

  try {
    // Check if the test date is valid and has passed 1 hour
    const testDateTime = new Date(testDate);
    const now = new Date();
    const timeDiff = now - testDateTime; // Time difference in milliseconds

    // If 1 hour has passed, we proceed with updating the status to 'delay'
    if (timeDiff >= 3600000) { // 3600000 milliseconds = 1 hour
      // Find the test schedule where the test status is still "Scheduled"
      const updatedTest = await ScheduleTest.findOneAndUpdate(
        { userMongoId, selectedCourse, selectedSubject, testStatus: 'Scheduled' },
        { testStatus: 'Delay' },  // Update to 'Delay'
        { new: true }
      );

      if (!updatedTest) {
        return res.status(404).json({ message: 'Test schedule not found or already updated.' });
      }

      // Send back the updated test schedule
      return res.status(200).json(updatedTest);
    } else {
      return res.status(400).json({ message: 'Test has not yet passed 1 hour.' });
    }
  } catch (error) {
    console.error('Error updating test status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Backend route to send a test reminder email 1 hour before the test
router.post('/scheduleTest/sendReminder', async (req, res) => {
  const { userMongoId, selectedCourse, selectedSubject, testDate, testTime } = req.body;

  // Calculate the time difference
  const testDateTime = new Date(testDate);
  const [hours, minutes] = testTime.split(':');
  testDateTime.setHours(hours);
  testDateTime.setMinutes(minutes);
  testDateTime.setSeconds(0);

  const now = new Date();
  const timeDiff = testDateTime - now;

  if (timeDiff <= 0 || timeDiff > 3600000) {
    return res.status(400).json({ message: 'Test is not within 1 hour.' });
  }

  // Send email reminder
  const user = await User.findById(userMongoId); // Assuming you have a User model to get the email
  if (!user || !user.email) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Call send email function (already defined in your backend)
  sendTestReminder(user.email, testDateTime, selectedCourse, selectedSubject);

  res.status(200).json({ message: 'Test reminder email sent.' });
});
// Backend route to send a test reminder email 24 hours before the test
router.post('/scheduleTest/sendReminder24Hours', async (req, res) => {
  const { userMongoId, selectedCourse, selectedSubject, testDate, testTime } = req.body;

  // Calculate the test date and time from the given testDate and testTime
  const testDateTime = new Date(testDate);
  const [hours, minutes] = testTime.split(':');
  testDateTime.setHours(hours);
  testDateTime.setMinutes(minutes);
  testDateTime.setSeconds(0);

  const now = new Date();
  const timeDiff = testDateTime - now;

  if (timeDiff <= 0 || timeDiff > 86400000) { // 86400000 milliseconds = 24 hours
    return res.status(400).json({ message: 'Test is not within 24 hours.' });
  }

  // Send email reminder 24 hours before the test
  const user = await User.findById(userMongoId); // Assuming you have a User model to get the email
  if (!user || !user.email) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Call send email function (already defined in your backend)
  sendTestReminder(user.email, testDateTime, selectedCourse, selectedSubject);

  res.status(200).json({ message: 'Test reminder email sent 24 hours before the test.' });
});

module.exports = router;