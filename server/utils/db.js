const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// MongoDB URI (store this in your .env file)
const mongoURI = process.env.MONGO_URI;
// MongoDB URI (correct syntax)
//const mongoURI = "mongodb+srv://edumock:sumaiya27@cluster0.qtrbi.mongodb.net/edumockdb?retryWrites=true&w=majority&appName=Cluster0";

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
