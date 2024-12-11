const express = require('express');
const router = express.Router();
const Subject = require("../models/subject-model");
const Course = require('../models/course-model');
const User = require("../models/user-model");
const DelayTest = require('../models/delaytest-model'); // Your model for delay test data

// Route to save delay test after successful payment
router.post('/', async (req, res) => {
  const { userId, selectedCourse, selectedSubject, testDate, testTime, amount, paymentId, orderId } = req.body;

  try {
    const delayTest = new DelayTest({
      userId,
      selectedCourse,
      selectedSubject,
      testDate,
      testTime,
      amount,
      paymentId,
      orderId
    });

    await delayTest.save(); // Save the delay test data to the database
    res.status(201).json({ message: 'Delay test data saved successfully', delayTest });
  } catch (error) {
    console.error('Error saving delay test data:', error);
    res.status(500).json({ message: 'Error saving delay test data' });
  }
});
// router.post('/', async (req, res) => {
//   const { userId, selectedCourse, selectedSubject, testDate, testTime, amount, paymentId, orderId } = req.body;

//   try {
//     // Create new delay test document (use fake IDs for testing if payment is not done)
//     const delayTest = new DelayTest({
//       userId,
//       selectedCourse,
//       selectedSubject,
//       testDate,
//       testTime,
//       amount,
//       paymentId: paymentId || "fakePaymentId",  // Use a fake paymentId for testing
//       orderId: orderId || "fakeOrderId"         // Use a fake orderId for testing
//     });

//     await delayTest.save(); // Save the delay test data to the database
//     res.status(201).json({ message: 'Delay test data saved successfully', delayTest });
//   } catch (error) {
//     console.error('Error saving delay test data:', error);
//     res.status(500).json({ message: 'Error saving delay test data' });
//   }
// });

// Route to get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('firstName lastName email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user); // Send user data
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
  // Get subject by ID
router.get('/subjects/:subjectId', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId).select('name');
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json(subject); // Send subject data
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
  // Get course by ID
router.get('/courses/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).select('name');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course); // Send course data
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
  
  
module.exports = router;