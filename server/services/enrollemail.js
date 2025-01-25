const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/user-model'); // Replace with your user model
const Course = require('../models/course-model'); // Replace with your course model
const Subject = require('../models/subject-model'); // Replace with your course model

const router = express.Router();

// Email sending endpoint
router.post('/send-enrollemail', async (req, res) => {
  const { userId, selectedCourse, selectedSubject } = req.body;

  try {
    // Fetch user and course details
    const user = await User.findById(userId);
    const course = await Course.findById(selectedCourse);

    // If multiple subjects are selected, fetch all subject details
    let subjectNames = [];
    if (Array.isArray(selectedSubject)) {
      const subjects = await Subject.find({ '_id': { $in: selectedSubject } });
      subjectNames = subjects.map(subject => subject.name);
    } else {
      // If only one subject is selected, fetch its details
      const subject = await Subject.findById(selectedSubject);
      subjectNames.push(subject.name);
    }

    // Configure NodeMailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your preferred email service
      auth: {
        user: 'support@edumocks.com', // Replace with your email
        pass: 'bhhl hpzx tgvb gvlk', // Replace with your email password or app-specific password
      },
    });

    // Email content
    const mailOptions = {
      from: 'support@edumocks.com',
      to: user.email,
      subject: `Test Assigned Successfully - ${course.name}`,
      text: `Hello ${user.firstName},

Test assigned for the course ${course.name} with the following subjects: ${subjectNames.join(', ')} is successful.

Now, you can schedule your test.

Best of luck!

The Edumocks Team
https://edumocks.com/`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

module.exports = router;
