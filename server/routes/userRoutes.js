const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user-model");

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
    const { firstName, lastName, email, countryCode, phone, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const fullPhoneNumber = countryCode + phone;
        const newUser = new User({ firstName, lastName, email, countryCode, phone, fullPhoneNumber, password });
        await newUser.save();
        
        res.status(201).json({ message: "User registered successfully", userId: newUser.userId });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(400).json({ message: "Error registering user", error: error.message });
    }
});

// Signin route
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        res.status(200).json({
            message: "Login successful",
            userId: user.userId,
            firstName: user.firstName,
        });
    } catch (error) {
        console.error("Error during sign-in:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get user by userId
router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findOne({ userId }, 'firstName'); // Fetch only firstName
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user); // Return user data
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Error fetching user data", error: error.message });
    }
});

// Get total student count (excluding admin)
router.get("/admin/total-users", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ email: { $ne: "support@eduinvest.in" } });
        res.status(200).json({ totalUsers });
    } catch (error) {
        console.error("Error fetching user count:", error);
        res.status(500).json({ message: "Error fetching user count", error: error.message });
    }
});

// Get all users excluding the admin and ordered by userId
router.get("/users", async (req, res) => {
    try {
        const users = await User.find({ 
            email: { $ne: 'kunal@edumocks.com' } }) .sort({ userId: 1 });
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
});

// Delete user by userId
router.delete("/user/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        console.log(`Attempting to delete user with ID: ${userId}`);
        const user = await User.findOneAndDelete({ userId });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`Successfully deleted user with ID: ${userId}`);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
});

// routes/userRoutes.js
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    console.log("Received request for userId:", userId); // Debugging log

    try {
        const user = await User.findOne({ userId });
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

// Get all users excluding the admin and ordered by userId
router.get('/', async (req, res) => {
    try {
        const users = await User.find(); // Fetch users from the database
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users", error });
    }
});

// Email verification route
router.post("/verify-email", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email not found" });
        }

        res.status(200).json({ success: true, message: "Email verified successfully." });
    } catch (error) {
        console.error("Error during email verification:", error);
        res.status(500).json({ message: "Server error during email verification", error: error.message });
    }
});

// Password reset route
router.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email not found" });
        }

        // If you don't want to re-hash, just directly store the newPassword
        user.password = newPassword;

        // Save the user with the new password (no hashing)
        await user.save();

        res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).json({ message: "Server error during password reset", error: error.message });
    }
});


router.get('/users', async (req, res) => {
    try {
      const users = await User.find({}, 'userId firstName lastName'); // Select userId, firstName, and lastName
      res.json(users); // Send the list of users as response
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  });
module.exports = router;