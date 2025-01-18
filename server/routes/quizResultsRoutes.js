// const express = require('express');
// const nodemailer = require('nodemailer');
// const multer = require('multer');
// const router = express.Router();
// const upload = multer(); // Handles file uploads
// require('dotenv').config();

// // POST route for sending quiz results via email with PDF attachment
// router.post('/sendQuizResults', upload.single('pdf'), (req, res) => {
//   const { userEmail } = req.body; // User's email address
//   const pdf = req.file.buffer; // PDF file sent in the request

//   // Setup the nodemailer transporter using Gmail (or another service)
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.GMAIL_USER, // Use environment variables for sensitive info
//       pass: process.env.GMAIL_PASS,  // Use environment variables for sensitive info
//     },
//   });

//   // Email options
//   const mailOptions = {
//     from: process.env.GMAIL_USER,  // Your Gmail address
//     to: userEmail,  // Recipient's email
//     subject: 'Your Quiz Results',
//     text: 'Please find attached your quiz results in the form of a PDF.',
//     attachments: [
//       {
//         filename: 'quiz-results.pdf',  // The filename of the attachment
//         content: pdf,  // The content of the PDF file
//       },
//     ],
//   };

//   // Send the email with the attached PDF
//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error('Error sending email:', error);
//       return res.status(500).send('Error sending email');
//     }
//     console.log('Email sent:', info.response);
//     return res.status(200).send('Email sent successfully');
//   });
// });

// module.exports = router;
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const router = express.Router();
const upload = multer(); // Handles file uploads
require('dotenv').config();

// POST route for sending quiz results via email with PDF attachment
router.post('/sendQuizResults', upload.single('pdf'), (req, res) => {
  const { userEmail} = req.body; // User's email, first name, and subject name
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
    subject: 'Test Completed! 🎉 Your Results and Solutions', // Subject of the email
    html: `
      <p>Hello,</p>
      <p>Congratulations on successfully completing your Test! 🎉 You've taken a big step forward in your exam preparation, and we’re excited to see your results.</p>
      
      <p>Your test has been submitted, and we’ve attached the Test Solutions for you to review. This will help you analyze your performance and identify areas for improvement.</p>
      
      <h3>Next Steps:</h3>
      <ul>
        <li>Review the solutions carefully to understand the correct answers.</li>
        <li>Identify areas where you can improve and focus your study efforts.</li>
        <li>Keep practicing to strengthen your knowledge and skills.</li>
      </ul>
      
      <p>We hope this test has been a valuable learning experience for you. Don’t hesitate to reach out if you have any questions or need further assistance.</p>
      
      <p>Keep up the great work, and we look forward to your continued progress!</p>
      
      <p>Best regards,<br>
      The Edumocks Team<br>
      <a href="https://edumocks.com/">Edumocks</a></p>
    `,  // HTML content of the email
    attachments: [
      {
        filename: 'quiz-results.pdf',  // The filename of the attachment
        content: pdf,  // The content of the PDF file
        cid: 'quiz-results.pdf'  // Content ID to reference the attachment in the HTML body
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
