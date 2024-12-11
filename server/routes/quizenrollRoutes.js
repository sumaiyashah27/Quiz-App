const express = require("express");
const router = express.Router();
const QuizEnroll = require("../models/quizenroll-model");
const User = require("../models/user-model");
const Course = require("../models/course-model");
const Subject = require('../models/subject-model');
const TestEnroll = require("../models/testenroll-model");

// Route to get quiz enrollments by userId with successful payments
router.get('/quizenroll/:userId', async (req, res) => {
  const userId = req.params.userId; // Extract userId from URL params

  try {
    // Fetch quiz enrollments with successful payment status for the given userId
    const quizEnrollments = await QuizEnroll.find({
      userId: userId,
      paymentStatus: 'success',
    })
      .populate('selectedCourse') // Populate selectedCourse with course document
      .populate('selectedSubject'); // Populate selectedSubject with subject documents

    // Send the quiz enrollments data as a response
    res.json(quizEnrollments);
  } catch (error) {
    console.error('Error fetching quiz enrollments:', error);
    res.status(500).json({ message: 'Server Error' }); // Handle server errors
  }
});

// Fetch all enrollments for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const enrollments = await QuizEnroll.find({ userId });
    res.status(200).json({ message: "Enrollments fetched successfully", enrollments });
  } catch (error) {
    console.error("Fetch enrollments error:", error);
    res.status(500).json({ message: "Failed to fetch enrollments", error });
  }
});

router.get("/api/course/:courseId", async (req, res) => {
  const { courseId } = req.params;

  try {
    console.log("Fetching course with ID:", courseId); // Log the incoming courseId
    const course = await Course.findById(courseId).populate("subjects");
    if (!course) {
      return res.status(404).send("Course not found");
    }

    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error); // Log the error
    res.status(500).send("Server Error");
  }
});

// POST route to save quiz enrollment
router.post('/quizenroll', async (req, res) => {
  try {
      const {
          userId,
          selectedCourse,
          selectedSubject,
          paymentStatus,
          paymentId,
          amount,
          order_id, // Check spelling and mapping here
      } = req.body;

      console.log('Enrollment data received:', req.body);

      // Create the enrollment object
      const enrollment = new QuizEnroll({
          userId,
          selectedCourse,
          selectedSubject,
          paymentStatus,
          paymentId,
          amount,
          order_id, // Ensure it is correctly assigned here
      });

      await enrollment.save();
      const testEnrollment = new TestEnroll({
        userId,
        selectedCourse,
        selectedSubject,
        paymentStatus,   // You can set "pending" or update it based on payment status
        paymentId,
        amount,
        order_id,
      });

      // Save the test enrollment
      await testEnrollment.save();
      res.status(200).json({ message: 'Enrollment saved successfully!' });
  } catch (error) {
      console.error('Error saving enrollment:', error);
      res.status(400).json({ message: 'Error saving enrollment', error });
  }
});

// Define the routes
router.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();  // Fetch users from the database
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
});


router.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find();  // Assuming you're fetching courses
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Error fetching courses", error });
  }
});

/// Route to fetch total quiz enrollments
router.get("/quizenroll/admin/total-enrollments", async (req, res) => {
  try {
    // Query the total count of quiz enrollments
    const totalEnrollments = await QuizEnroll.countDocuments();
    res.status(200).json({ totalEnrollments });
  } catch (error) {
    console.error("Error fetching total enrollments:", error);
    res.status(500).json({ message: "Failed to fetch total enrollment count" });
  }
});
// Endpoint to delete a specific subject from the quizenroll collection
router.delete('/quizenroll/:userId/:courseId/:subjectId', async (req, res) => {
  const { userId, courseId, subjectId } = req.params;

  try {
    // Find the document and update it by removing the specific subject
    const result = await QuizEnroll.findOneAndUpdate(
      { userId, selectedCourse: courseId },
      { $pull: { selectedSubject: subjectId } },
      { new: true } // Return the updated document
    );

    if (!result) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    // If there are no subjects left for this course, delete the entire enrollment entry
    if (result.selectedSubject.length === 0) {
      await QuizEnroll.deleteOne({ userId, selectedCourse: courseId });
      return res.status(200).json({ message: 'Enrollment deleted as no subjects remain.' });
    }

    res.status(200).json({ message: 'Subject removed successfully', updatedEnrollment: result });
  } catch (error) {
    console.error('Error removing subject:', error);
    res.status(500).json({ message: 'Error removing subject', error });
  }
});
module.exports = router;