/**
 * Image Loader Utility
 * Handles loading and caching images for PDF generation
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ImageLoader {
  constructor() {
    // In-memory cache for loaded images
    this.cache = new Map();
    // Cache TTL: 15 minutes
    this.cacheTTL = 15 * 60 * 1000;
  }

  /**
   * Load local image from assets folder
   * @param {string} relativePath - Path relative to assets folder
   * @returns {Promise<string|null>} - Full path to image or null if not found
   */
  async load(relativePath) {
    try {
      // Construct full path
      const fullPath = path.join(__dirname, '../../../../assets', relativePath);

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        console.warn(`Image not found: ${fullPath}`);
        return null;
      }

      // PDFKit can use file paths directly
      return fullPath;
    } catch (error) {
      console.error(`Error loading local image ${relativePath}:`, error.message);
      return null;
    }
  }

  /**
   * Load image from URL and cache it
   * @param {string} url - Image URL
   * @returns {Promise<Buffer|null>} - Image buffer or null if failed
   */
  async loadFromUrl(url) {
    try {
      // Check cache first
      const cached = this.getFromCache(url);
      if (cached) {
        console.log(`Cache hit for: ${url}`);
        return cached;
      }

      console.log(`Fetching image from: ${url}`);

      // Fetch image
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000, // 10 second timeout
        maxContentLength: 5 * 1024 * 1024, // 5MB max
        headers: {
          'User-Agent': 'TripAndEvent-PDF-Generator/1.0'
        }
      });

      // Convert to buffer
      const buffer = Buffer.from(response.data);

      // Cache for future use
      this.addToCache(url, buffer);

      return buffer;
    } catch (error) {
      console.error(`Failed to load image from ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Load multiple images in parallel
   * @param {string[]} urls - Array of image URLs
   * @returns {Promise<Array<Buffer|null>>} - Array of image buffers
   */
  async loadMultiple(urls) {
    const promises = urls.map(url => this.loadFromUrl(url));
    return await Promise.all(promises);
  }

  /**
   * Get image from cache
   * @private
   */
  getFromCache(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Add image to cache
   * @private
   */
  addToCache(key, data) {
    // Limit cache size to prevent memory issues
    if (this.cache.size > 100) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear entire cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Image cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Load and validate logo
   * Returns logo path or null
   */
  async loadLogo() {
    const logoPath = await this.load('images/Logo.png');

    if (!logoPath) {
      console.warn('Logo not found, PDF will be generated without logo');
      // Try alternative formats as fallback
      const altPath = await this.load('images/logo.png');
      return altPath;
    }

    return logoPath;
  }

  /**
   * Load fallback placeholder image
   * Used when actual image fails to load
   */
  async loadPlaceholder() {
    const placeholderPath = await this.load('/images/placeholder.png');
    return placeholderPath;
  }

  /**
   * Validate image buffer
   * Check if buffer is a valid image
   */
  isValidImage(buffer) {
    if (!buffer || !(buffer instanceof Buffer)) {
      return false;
    }

    // Check for common image signatures
    const jpegSignature = buffer.slice(0, 3).toString('hex') === 'ffd8ff';
    const pngSignature = buffer.slice(0, 8).toString('hex') === '89504e470d0a1a0a';

    return jpegSignature || pngSignature;
  }
}

module.exports = ImageLoader;
