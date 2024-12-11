const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET

});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'emkaan',
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'svg'],
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

// Configure upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            console.error('No file uploaded.');
            return res.status(400).json({
                success: false,
                error: 'Please upload a file'
            });
        }

        res.status(200).json({
            success: true,
            url: req.file.path,
            message: 'File uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error uploading file'
        });
    }
};

// Middleware for handling upload
exports.uploadMiddleware = upload.single('image');
