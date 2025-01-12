const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const Image = require('../models/image-model'); // Ensure this path points to your Image model

const router = express.Router();

// Define the folder where images will be stored
const uploadFolder = path.join(__dirname, '../image'); // Path to the images folder
fs.ensureDirSync(uploadFolder); // Ensure the folder exists

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 70 * 1024 * 1024 }, // 70 MB file size limit
});

// Route: Upload images
router.post('/upload-images', upload.array('images', 100), async (req, res) => {
  try {
    const imageRecords = req.files.map((file) => ({
      name: file.originalname,
      location: `/images/${file.filename}`,
    }));

    const savedImages = await Image.insertMany(imageRecords);
    res.status(201).json(savedImages);
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).send('Error uploading images');
  }
});

// Route: Get all uploaded images
router.get('/', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    console.error('Error retrieving images:', error);
    res.status(500).send('Error retrieving images');
  }
});

// Route: Delete an image
router.delete('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { location } = req.body;

    if (!location) {
      return res.status(400).send('Image location not provided');
    }

    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).send('Image not found');
    }

    await Image.findByIdAndDelete(imageId);

    const imagePath = path.join(uploadFolder, path.basename(location));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.send('Image deleted successfully');
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).send('Error deleting image');
  }
});

module.exports = router;
