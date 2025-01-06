const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/user-model')
const ScheduleTest = require('../models/scheduletest-model');
const router = express.Router();
const mongoose = require('mongoose');

// POST route to send email
router.post('/send-email', async (req, res) => {
  const { email, firstName } = req.body;

  if (!email || !firstName) {
    return res.status(400).send({ message: 'Email and first name are required.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sumaiyashaha27@gmail.com', // Your Gmail email address
      pass: 'pjgm ugej bytp pkak',     // Your Gmail app password
    },
  });

  const mailOptions = {
    from: '"Edumocks" <sumaiyashaha27@gmail.com>',
    to: email, // User's email
    subject: 'Welcome to Edumocks!',
    html: `<p>Hi ${firstName},</p><p>Welcome to Edumocks! Start practicing CFA level exams today at <a href="https://edumocks.com">Edumocks</a>.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Welcome email sent!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Failed to send email' });
  }
});

// Log ScheduledTest to verify it is properly imported
console.log(ScheduleTest);  // Check if the model is imported correctly
const sendEmailReminder = async (userEmail, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sumaiyashaha27@gmail.com',
      pass: 'pjgm ugej bytp pkak',
    },
  });

  const mailOptions = {
    from: '"Edumocks" <sumaiyashaha27@gmail.com>',
    to: userEmail, // Recipient's email
    subject: subject,
    html: `<p>${message}</p>`, // Email body content
  };

  try {
    // Email sending logic
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send reminder email');
  }
};

// Endpoint to send reminder emails
router.post('/send-reminder-email', async (req, res) => {
  try {
    const scheduledTests = await ScheduleTest.find({ testStatus: 'Scheduled' });
    console.log('Scheduled Tests:', scheduledTests); // Log the scheduled tests to check if any tests exist

    if (!scheduledTests || scheduledTests.length === 0) {
      return res.status(400).send({ message: 'No scheduled tests found.' });
    }

    const now = new Date().getTime();  // Get current time in milliseconds (UTC)
    let emailCount = 0;
    const usersToNotify = [];

    for (const test of scheduledTests) {
      const { testDate, testTime, selectedCourse, selectedSubject } = test;

      // Combine test date and time into a valid Date object (in UTC)
      const testDateTime = new Date(testDate);
      const [hours, minutes] = testTime.split(':').map(Number);
      testDateTime.setHours(hours, minutes, 0, 0);

      const testDateTimeUTC = testDateTime.getTime(); // Convert to milliseconds (UTC)
      const timeToTest = testDateTimeUTC - now; // Calculate the difference between current time and test time

      console.log('Current Time:', now);
      console.log('Test DateTime (UTC):', testDateTimeUTC);
      console.log('Time to Test (milliseconds):', timeToTest);
      
      // 24-hour reminder: Send reminder 24 hours before the test
      if (
        (timeToTest <= 24 * 60 * 60 * 1000 && timeToTest > 23 * 60 * 60 * 1000) ||
        (timeToTest <= 1 * 60 * 60 * 1000 && timeToTest > 0)
      ) {
        const users = await User.find({
          selectedCourse: new mongoose.Types.ObjectId(selectedCourse), // Fix for ObjectId
          selectedSubject: new mongoose.Types.ObjectId(selectedSubject), // Fix for ObjectId
        });
      
        console.log('Users matching criteria:', users);
      
        for (const user of users) {
          const message = `Hi ${user.firstName}, your test for ${selectedCourse} - ${selectedSubject} is scheduled ${
            timeToTest <= 24 * 60 * 60 * 1000 ? 'in 24 hours.' : 'in 1 hour.'
          }`;
          usersToNotify.push({ email: user.email, message });
        }
        emailCount += users.length;
      }      
    }

    for (const { user, message } of usersToNotify) {
      try {
        await sendEmailReminder(user.email, 'Test Reminder', message);
      } catch (error) {
        console.error(`Failed to send reminder to ${user.email}:`, error.message);
      }
    }

    res.status(200).send({ message: `${emailCount} reminder emails sent successfully!` });
  } catch (error) {
    console.error('Error in /send-reminder-email route:', error);
    res.status(500).send({ message: 'Failed to send reminder emails. Please check the server logs for more details.' });
  }
});

module.exports = router;
