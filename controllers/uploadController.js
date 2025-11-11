const Media = require('../models/Media');
const cloudinary = require('../config/cloudinary');

// Upload media files
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { uploader = 'Guest', message = '' } = req.body;
    
    // Process each uploaded file
    const mediaFiles = await Promise.all(
      req.files.map(async (file) => {
        const media = new Media({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          cloudinaryUrl: file.path,
          cloudinaryPublicId: file.filename,
          uploader: uploader,
          message: message
        });

        return await media.save();
      })
    );

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files: mediaFiles.map(file => ({
          id: file._id,
          filename: file.filename,
          originalName: file.originalName,
          size: file.size,
          cloudinaryUrl: file.cloudinaryUrl,
          uploadedAt: file.uploadedAt
        }))
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded files from Cloudinary if there's an error
    if (req.files) {
      req.files.forEach(file => {
        cloudinary.uploader.destroy(file.filename);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all media (for admin purposes)
exports.getAllMedia = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const media = await Media.find()
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Media.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        media,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching media'
    });
  }
};

// Serve media files by redirecting to Cloudinary URL
exports.serveMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    res.redirect(media.cloudinaryUrl);
  } catch (error) {
    console.error('Serve media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving media'
    });
  }
};

// Delete media (admin function)
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Delete file from Cloudinary
    await cloudinary.uploader.destroy(media.cloudinaryPublicId);

    // Delete from database
    await Media.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting media'
    });
  }
};
