const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure cloudinary if environment variables are available
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dpte7rafe',
    api_key: process.env.CLOUDINARY_API_KEY || '441345834382446',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'wYtPragiNwqD6qVYN1Hh89pC1kg'
  });
  console.log('Cloudinary configured successfully');
} catch (err) {
  console.error('Failed to configure Cloudinary:', err);
}

// Create a disk storage as a fallback
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Create cloudinary storage if properly configured
let storage;
try {
  if (process.env.CLOUDINARY_CLOUD_NAME || 'dpte7rafe' && process.env.CLOUDINARY_API_KEY || '441345834382446' && process.env.CLOUDINARY_API_SECRET || 'wYtPragiNwqD6qVYN1Hh89pC1kg') {
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'politicians',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
      }
    });
    console.log('Using Cloudinary storage');
  } else {
    console.log('Cloudinary environment variables not set, using disk storage');
    storage = diskStorage;
  }
} catch (err) {
  console.error('Error setting up CloudinaryStorage, falling back to disk storage:', err);
  storage = diskStorage;
}

// Setup multer for handling file uploads
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
  }
});

module.exports = {
  cloudinary,
  upload
};