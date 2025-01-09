const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/user-model')
const ScheduleTest = require('../models/scheduletest-model');
const router = express.Router();

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

module.exports = router;