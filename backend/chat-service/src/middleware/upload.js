const multer = require('multer');
const { ApiError } = require('../../../shared/src/utils');

// Use memory storage - we'll process the buffer before saving
const storage = multer.memoryStorage();

// File filter for chat media (images + audio)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/webm',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/x-m4a',
    'audio/aac',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // Only 1 file at a time
  },
});

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(ApiError.badRequest('File too large. Maximum size is 5MB'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(ApiError.badRequest('Too many files. Only 1 file allowed'));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(ApiError.badRequest('Unexpected field name for file upload'));
    }
    return next(ApiError.badRequest(err.message));
  }

  if (err) {
    return next(ApiError.badRequest(err.message));
  }

  next();
};

// Chat media upload middleware
const uploadMedia = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    handleMulterError(err, req, res, next);
  });
};

module.exports = {
  upload,
  uploadMedia,
  handleMulterError,
};
