const express = require("express");
const cors = require('cors');
const multer = require("multer");
const path = require("path"); // Import path module
const connectDB = require("./utils/db");
require('dotenv').config();

const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const imageRoutes = require('./routes/imageRoutes');
const paymentRoutes = require("./routes/paymetRoutes");
const quizEnrollRoutes = require("./routes/quizenrollRoutes");
const scheduleTestRoutes = require("./routes/scheduletestRoutes");
const quizResultsRoutes = require('./routes/quizResultsRoutes');
const testEnrollRoutes = require("./routes/testenrollRoutes");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const delayTestRoutes = require('./routes/delayTestRoutes');
const app = express();


app.use(cors({
    origin: ["https://edumocks.com", "https://www.edumocks.com", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"], // Ensure all needed methods are allowed
    credentials: true, // If you're using cookies or other credentials
}));
app.use(express.json());

// Serve static images from the "images" folder (adjust the folder name if needed)
app.use('/images', express.static(path.join(__dirname, './image'))); // Replace 'images' with your actual image folder

// Use route files
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/scheduleTest", scheduleTestRoutes);
app.use("/api", quizEnrollRoutes);
app.use('/api/quizResults', quizResultsRoutes);
app.use("/api/testEnroll", testEnrollRoutes);
app.use("/api/delayTest",delayTestRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT,'0.0.0.0', () => {
        console.log(`Server is now running on port ${PORT}`);
    });
});
