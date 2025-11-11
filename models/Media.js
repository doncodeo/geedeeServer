const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: false
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  uploader: {
    type: String,
    default: 'Guest'
  },
  message: {
    type: String,
    maxlength: 500
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-delete documents after 30 days (optional)
mediaSchema.index({ uploadedAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Media', mediaSchema);