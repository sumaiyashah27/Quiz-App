// services/cronJob.js
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const ScheduleTest = require('../models/scheduletest-model');
const User = require('../models/user-model');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email service
  auth: {
    user: 'sumaiyashaha27@gmail.com', // From your .env file
    pass: 'pjgm ugej bytp pkak', // App-specific password from .env
  },
});

// Function to send email reminders
const sendTestReminder = (userEmail, testDate, courseName, subjectName, reminderTime) => {
  const mailOptions = {
    from: process.env.GMAIL_USER, // Your email (from environment variable)
    to: userEmail,
    subject: `Test Reminder: Your ${courseName} test is in ${reminderTime}!`,
    text: `Dear user, \n\nThis is a reminder that your test for ${courseName} on ${subjectName} is starting in ${reminderTime}.\n\nBest of luck!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Schedule a cron job to check for tests about to start in 1 hour or 24 hours
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead

  // Find tests scheduled to start in 1 hour or 24 hours
  const tests = await ScheduleTest.find({
    testStatus: 'Scheduled', // Check only scheduled tests
    testDate: { $gte: now },
    $or: [
      { testDate: { $lt: oneHourFromNow } },  // 1 hour from now
      { testDate: { $lt: twentyFourHoursFromNow } },  // 24 hours from now
    ],
  });

  tests.forEach(async (test) => {
    const { userId, selectedCourse, selectedSubject, testDate } = test;
    const timeDiff = testDate - now;
    
    let reminderTime = '';
    if (timeDiff <= 3600000) { // 1 hour
      reminderTime = '1 hour';
    } else if (timeDiff <= 86400000) { // 24 hours
      reminderTime = '24 hours';
    }

    const user = await User.findById(userId);
    if (user && user.email && reminderTime) {
      sendTestReminder(user.email, testDate, selectedCourse, selectedSubject, reminderTime);
    }
  });
});
