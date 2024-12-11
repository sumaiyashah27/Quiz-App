const express = require("express");
const router = express.Router();
const TestEnroll = require("../models/testenroll-model"); // Import the TestEnroll schema
const QuizEnroll = require("../models/quizenroll-model"); // Import the QuizEnroll schema

// API endpoint to handle test enrollment
router.post("/testEnroll", async (req, res) => {
    const { userId, selectedCourse, selectedSubject } = req.body;
  
    try {
      // Find the matching quiz enrollment
      const quizEnrollment = await QuizEnroll.findOne({
        userId,
        selectedCourse,
        selectedSubject: { $in: selectedSubject }, // Ensure selectedSubject matches at least one element
      });
  
      // If no matching quiz enrollment is found, return an error
      if (!quizEnrollment) {
        return res.status(400).json({ success: false, message: "Quiz enrollment not found" });
      }
  
      // Create a new TestEnroll document using data from the QuizEnroll document
      const newTestEnroll = new TestEnroll({
        userId,
        selectedCourse,
        selectedSubject,
        paymentStatus: "pending", // Default status, could be updated based on payment
        amount: quizEnrollment.amount, // Amount from quiz enrollment
        order_id: quizEnrollment.order_id, // Order ID from quiz enrollment
        createdAt: new Date(), // Set createdAt to the current date
      });
  
      // Save the new test enrollment
      await newTestEnroll.save();
  
      // Return success response
      res.status(200).json({ success: true, message: "Test enrolled successfully!" });
    } catch (error) {
      console.error("Error enrolling for the test:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  

module.exports = router;
