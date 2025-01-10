const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/user-model')
const ScheduleTest = require('../models/scheduletest-model');
const router = express.Router();
require('dotenv').config();


// POST route to send email
router.post('/send-email', async (req, res) => {
  const { email, firstName } = req.body;

  if (!email || !firstName) {
    return res.status(400).send({ message: 'Email and first name are required.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'support@edumocks.com', // Your Gmail email address
      pass: 'bhhl hpzx tgvb gvlk',     // Your Gmail app password
    },
  });

  const mailOptions = {
    from: '"Edumocks" <support@edumocks.com>',
    to: email, // User's email
    subject: 'Welcome to EduMocks! 🎉',
    html: `
      <p>Dear ${firstName},</p>
      <p>Welcome to EduMocks! 🎉 You’ve taken the first step toward mastering your exam preparation, and we’re excited to help you along the way.</p>
      <p>Are you ready to kickstart your journey? 💡 We invite you to take your <strong>FIRST MOCK TEST</strong> now!</p>
      <h3>🌟 Why Take the First Mock Test?</h3>
      <ul>
        <li>Accurate Exam Simulation</li>
        <li>Detailed Performance Analysis</li>
        <li>Track Your Progress</li>
      </ul>
      <p>👉 <a href="https://edumocks.com/">Start Your First Mock Test Today!</a></p>
      <p>Don’t wait! Your exam preparation can take a huge leap forward with your first mock test. Let Edumocks help you stay on track to achieve your goals!</p>
      <p>Best of luck with your mock test, and we’re here to support you every step of the way!</p>
      <p>Warm regards,<br>The EduMocks Team</p>
      <p>Visit: <a href="https://edumocks.com/">EduMocks.com</a></p>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Welcome email sent!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Failed to send email', error: error.toString() });
  }
});

// Log ScheduledTest to verify it is properly imported
console.log(ScheduleTest);  // Check if the model is imported correctly

module.exports = router;