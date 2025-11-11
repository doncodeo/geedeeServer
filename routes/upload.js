const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// Upload multiple files
router.post('/upload', upload.array('media', 10), uploadController.uploadMedia);

// Get all media (for admin)
router.get('/media', uploadController.getAllMedia);

// Serve individual media file
router.get('/media/:id', uploadController.serveMedia);

// Delete media (admin)
router.delete('/media/:id', uploadController.deleteMedia);

module.exports = router;