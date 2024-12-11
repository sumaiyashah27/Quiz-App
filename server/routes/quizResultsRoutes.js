const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const router = express.Router();
const upload = multer(); // Handles file uploads
require('dotenv').config();

// POST route for sending quiz results via email with PDF attachment
router.post('/sendQuizResults', upload.single('pdf'), (req, res) => {
  const { userEmail } = req.body; // User's email address
  const pdf = req.file.buffer; // PDF file sent in the request

  // Setup the nodemailer transporter using Gmail (or another service)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Use environment variables for sensitive info
      pass: process.env.GMAIL_PASS,  // Use environment variables for sensitive info
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.GMAIL_USER,  // Your Gmail address
    to: userEmail,  // Recipient's email
    subject: 'Your Quiz Results',
    text: 'Please find attached your quiz results in the form of a PDF.',
    attachments: [
      {
        filename: 'quiz-results.pdf',  // The filename of the attachment
        content: pdf,  // The content of the PDF file
      },
    ],
  };

  // Send the email with the attached PDF
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Error sending email');
    }
    console.log('Email sent:', info.response);
    return res.status(200).send('Email sent successfully');
  });
});

module.exports = router;
