const express = require('express');
const Course = require('../models/course-model');
const Subject = require('../models/subject-model');
const QuizEnroll = require('../models/quizenroll-model');
const router = express.Router();

// Create a course
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const course = new Course({ name });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error });
  }
});

// GET request to fetch all courses with populated subjects and chapters
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate({
        path: 'subjects',
        populate: {
          path: 'questions',
        },
      }); // Populate subjects and chapters
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Add a subject to a course
router.put('/:courseId/add-subject', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { subjectId } = req.body;

    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find the subject by ID
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Add the subject to the course's subjects array
    if (course.subjects.includes(subjectId)) {
      return res.status(400).json({ message: 'Subject already added to the course' });
    }

    course.subjects.push(subjectId);
    await course.save();
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error adding subject to course', error });
  }
});

// Remove a subject from a course
router.put('/:courseId/remove-subject', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { subjectId } = req.body;

    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Remove the subject from the course's subjects array
    course.subjects = course.subjects.filter(sub => sub.toString() !== subjectId);
    await course.save();
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error removing subject from course', error });
  }
});

// DELETE route to delete a course
router.delete('/:id', async (req, res) => {
  const { id } = req.params; // Get the courseId from the URL parameter

  try {
    // Attempt to find and delete the course by its ObjectId
    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting course' });
  }
});
// Get a course's subjects, chapters, and questions (with detailed population)
router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find the course and populate the subjects, chapters, and questions
    const course = await Course.findById(courseId)
      .populate({
        path: 'subjects',
        populate: {
          path: 'questions',
        },
      });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course details', error });
  }
});

// Example of an Express route for fetching subjects based on courseId
router.get('/api/subjects', (req, res) => {
  const { courseId } = req.query;

  // Assuming you have a Subject model and each subject has a reference to the course
  Subject.find({ course: courseId })
    .then(subjects => res.json(subjects))
    .catch(error => res.status(500).json({ message: "Error fetching subjects", error }));
});

// Route to fetch all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find(); // Adjust based on your database model
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Error fetching courses", error });
  }
});
// Express.js route handler to fetch courses for a given user
router.get('/courses', async (req, res) => {
  try {
    const userMongoId = req.query.userId; // MongoDB userId from query parameters
    if (!userMongoId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find quiz enrollments based on userMongoId and populate course and subject details
    const quizEnrollments = await QuizEnroll.find({ userId: mongoose.Types.ObjectId(userMongoId) })
      .populate('selectedCourse')  // Populating selectedCourse with the Course details
      .populate('selectedSubject');  // Populating selectedSubject with the Subject details

    if (quizEnrollments.length === 0) {
      return res.status(404).json({ message: 'No quiz enrollments found for this user.' });
    }

    // Sending populated data back to frontend
    res.json(quizEnrollments);
  } catch (err) {
    console.error('Error fetching quiz enrollments:', err);
    res.status(500).json({ message: 'Error fetching quiz enrollments.' });
  }
});

// Route for fetching quiz enrollments for a user
router.get('/quizenroll', async (req, res) => {
  try {
    const { userId } = req.query;  // Get the userId from query params

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    console.log('Fetching quiz enrollments for userId:', userId);  // Debugging

    // Query the QuizEnrollment model to fetch data based on the userId
    const enrollments = await QuizEnrollment.find({ userId });

    if (!enrollments || enrollments.length === 0) {
      return res.status(404).json({ message: 'No quiz enrollments found' });
    }

    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching quiz enrollments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Backend Route to fetch course by ObjectId or name (for flexibility)
router.get('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let course;

    // Check if 'id' is a valid ObjectId (MongoDB's unique identifier)
    if (mongoose.Types.ObjectId.isValid(id)) {
      course = await Course.findById(id);
    } else {
      course = await Course.findOne({ name: id });
    }

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Error fetching course details", error });
  }
});

// Get all courses with subjects
router.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().populate('subjects'); // Assuming subjects is populated
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching courses' });
  }
});  

module.exports = router;
