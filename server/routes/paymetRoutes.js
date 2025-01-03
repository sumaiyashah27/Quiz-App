const express = require("express");
const router = express.Router();
const QuizEnroll = require("../models/quizenroll-model");
const User = require("../models/user-model");
const Course = require("../models/course-model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');

// const razorpayInstance = new Razorpay({
//   key_id: 'rzp_live_fqff2XESMLOL6K',
//   key_secret: 's6Xy2ELAaobIXuQL2TT3SyR8',
// });

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// // Create Razorpay Order
// router.post('/api/payment/create-razorpay-order', async (req, res) => {
//   try {
//     const { amount } = req.body; // Amount in paise (e.g., 50000 for ₹500)
//     const options = {
//       amount: amount, 
//       currency: 'INR',
//       receipt: `receipt_${Date.now()}`,
//     };
//     const order = await razorpayInstance.orders.create(options);
//     res.json({ success: true, order });
//   } catch (error) {
//     console.error('Error creating Razorpay order:', error);
//     res.status(500).json({ success: false, message: 'Error creating Razorpay order.' });
//   }
// });

// Mock payment gateway simulation (Replace with Razorpay/Stripe in production)
router.post("/", async (req, res) => {
  const { userId, selectedCourse, selectedSubject, amount } = req.body;

  if (!userId || !selectedCourse || !selectedSubject || !amount) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Save initial payment record with "pending" status
    const enrollment = new QuizEnroll({
      userId,
      selectedCourse,
      selectedSubject,
      amount,
      paymentStatus: "pending",
    });

    const savedEnrollment = await enrollment.save();

    // Simulate payment gateway interaction
    const paymentId = `PAY-${Date.now()}`; // Mock payment ID
    setTimeout(async () => {
      savedEnrollment.paymentStatus = "success";
      savedEnrollment.paymentId = paymentId;
      await savedEnrollment.save();
      console.log("Payment successful for:", paymentId);
    }, 5000); // Simulate 5 seconds delay for payment

    res.status(200).json({
      message: "Payment initiated",
      enrollmentId: savedEnrollment._id,
      paymentId,
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: "Payment failed", error });
  }
});

// Backend: Fetch course with its subjects based on courseId
router.get("/api/course/:courseId", async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId).populate("subjects"); // Assuming 'subjects' is an array of ObjectIds
    if (!course) {
      return res.status(404).send("Course not found");
    }

    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).send("Server Error");
  }
});
// Route to get user details by userId
router.get("/api/users/:userId", async (req, res) => {
  const { userId } = req.params; // Get userId from the route parameter

  try {
    const user = await User.findOne({ userId: userId }); // Find user by userId
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      _id: user._id,
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user details", error });
  }
});
// router.post('/create-payment-intent', async (req, res) => {
//   const { amount } = req.body;

//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency: 'usd',
//     });

//     res.send({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (error) {
//     console.error("Error creating payment intent:", error);
//     res.status(500).json({ message: "Failed to create payment intent", error });
//   }
// });

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    // Specify the currency (e.g., "usd" or "inr")
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd', // or 'inr' depending on your requirement
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(400).send({ error: error.message });
  }
});


// Endpoint to create payment intent
router.post("/create-razorpay-order", async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const options = {
      amount, // Amount in smallest unit (e.g., paise for INR)
      currency, // Pass the selected currency
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Error creating Razorpay order." });
  }
});


module.exports = router;