const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Logger helper
const log = {
  info: (msg, meta = {}) => console.log(`[CHAT-UPLOAD] INFO: ${msg}`, JSON.stringify(meta)),
  warn: (msg, meta = {}) => console.warn(`[CHAT-UPLOAD] WARN: ${msg}`, JSON.stringify(meta)),
  error: (msg, meta = {}) => console.error(`[CHAT-UPLOAD] ERROR: ${msg}`, JSON.stringify(meta)),
};

// Configuration
const isProduction = process.env.NODE_ENV === 'production';
const useS3 = isProduction || process.env.USE_S3 === 'true';

// S3 Configuration
const s3Config = {
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'tripandevent-media';
const S3_PREFIX = 'chat-media/';

// Local storage configuration
const LOCAL_UPLOAD_DIR = path.join(__dirname, '../../uploads/chat-media');
const LOCAL_BASE_URL = process.env.LOCAL_UPLOAD_URL || 'http://localhost:3008/uploads/chat-media';

// Image processing settings
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  medium: { width: 400, height: 400 },
  large: { width: 800, height: 800 },
};

// Allowed MIME types
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const AUDIO_MIME_TYPES = [
  'audio/webm',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
];
const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...AUDIO_MIME_TYPES];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

class ChatUploadService {
  constructor() {
    this.s3Client = null;

    if (useS3) {
      if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        log.warn('S3 credentials not configured - falling back to local storage');
      } else {
        this.s3Client = new S3Client(s3Config);
        log.info('S3 client initialized', { bucket: S3_BUCKET, region: s3Config.region });
      }
    }

    // Ensure local upload directory exists
    if (!useS3 || !this.s3Client) {
      this.ensureLocalDir();
    }
  }

  ensureLocalDir() {
    if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
      fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
      log.info('Created local upload directory', { path: LOCAL_UPLOAD_DIR });
    }
  }

  /**
   * Validate uploaded file
   */
  validateFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    return true;
  }

  /**
   * Process image - resize and optimize
   */
  async processImage(buffer, size = 'large') {
    const dimensions = IMAGE_SIZES[size] || IMAGE_SIZES.large;

    return sharp(buffer)
      .resize(dimensions.width, dimensions.height, {
        fit: 'inside', // Maintain aspect ratio, fit within bounds
        withoutEnlargement: true, // Don't upscale small images
      })
      .webp({ quality: 85 }) // Convert to WebP for better compression
      .toBuffer();
  }

  /**
   * Generate unique filename
   */
  generateFileName(userId, originalName, mimeType) {
    const extensionMap = {
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/x-m4a': 'm4a',
      'audio/aac': 'aac',
    };
    const originalExt = path.extname(originalName || '').replace('.', '').toLowerCase();
    const mimeExt = mimeType ? extensionMap[mimeType] : '';
    const ext = IMAGE_MIME_TYPES.includes(mimeType) ? 'webp' : (mimeExt || originalExt || 'bin');
    const uniqueId = uuidv4().split('-')[0];
    const timestamp = Date.now();
    return `${userId}_${timestamp}_${uniqueId}.${ext}`;
  }

  /**
   * Upload to S3
   */
  async uploadToS3(buffer, fileName, contentType = 'image/webp') {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const key = `${S3_PREFIX}${fileName}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000', // 1 year cache
    });

    await this.s3Client.send(command);

    // Return the S3 URL
    const url = `https://${S3_BUCKET}.s3.${s3Config.region}.amazonaws.com/${key}`;
    log.info('Chat media uploaded to S3', { key, bucket: S3_BUCKET });

    return url;
  }

  /**
   * Upload to local filesystem
   */
  async uploadToLocal(buffer, fileName) {
    this.ensureLocalDir();

    const filePath = path.join(LOCAL_UPLOAD_DIR, fileName);
    await fs.promises.writeFile(filePath, buffer);

    const url = `${LOCAL_BASE_URL}/${fileName}`;
    log.info('Chat media saved locally', { path: filePath });

    return url;
  }

  /**
   * Delete from S3
   */
  async deleteFromS3(fileUrl) {
    if (!this.s3Client || !fileUrl) return;

    try {
      // Extract key from URL
      const urlParts = new URL(fileUrl);
      const key = urlParts.pathname.slice(1); // Remove leading slash

      const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      });

      await this.s3Client.send(command);
      log.info('Chat media deleted from S3', { key });
    } catch (error) {
      log.error('Failed to delete from S3', { error: error.message, url: fileUrl });
    }
  }

  /**
   * Delete from local filesystem
   */
  async deleteFromLocal(fileUrl) {
    if (!fileUrl) return;

    try {
      // Extract filename from URL
      const fileName = path.basename(fileUrl);
      const filePath = path.join(LOCAL_UPLOAD_DIR, fileName);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        log.info('Chat media deleted locally', { path: filePath });
      }
    } catch (error) {
      log.error('Failed to delete local file', { error: error.message, url: fileUrl });
    }
  }

  /**
   * Main upload method - handles both S3 and local storage
   */
  async uploadChatMedia(file, userId) {
    // Validate file
    this.validateFile(file);

    const isImage = IMAGE_MIME_TYPES.includes(file.mimetype);
    const buffer = isImage ? await this.processImage(file.buffer, 'large') : file.buffer;
    const contentType = isImage ? 'image/webp' : file.mimetype;
    const fileName = this.generateFileName(userId, file.originalname, file.mimetype);

    let url;

    // Upload to appropriate storage
    if (useS3 && this.s3Client) {
      url = await this.uploadToS3(buffer, fileName, contentType);
    } else {
      url = await this.uploadToLocal(buffer, fileName);
    }

    return {
      url,
      fileName,
      originalName: file.originalname,
      size: buffer.length,
      mimeType: contentType,
      storage: useS3 && this.s3Client ? 's3' : 'local',
    };
  }

  /**
   * Delete chat media
   */
  async deleteChatMedia(fileUrl) {
    if (!fileUrl) return;

    if (fileUrl.includes('s3.')) {
      await this.deleteFromS3(fileUrl);
    } else if (fileUrl.includes('/uploads/')) {
      await this.deleteFromLocal(fileUrl);
    }
  }
}

module.exports = new ChatUploadService();
