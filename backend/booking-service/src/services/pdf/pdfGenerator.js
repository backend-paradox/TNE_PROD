/**
 * PDF Generator - Main Orchestrator
 * Coordinates PDF generation for travel itinerary documents
 */

const PDFDocument = require('pdfkit');
const path = require('path');
const { pdfConfig, colors, fonts, fontSize, branding } = require('../../config/pdf.config');
const ImageLoader = require('./utils/imageLoader');

// Section renderers
const CoverPage = require('./templates/sections/coverPage');
const BookingInfo = require('./templates/sections/bookingInfo');
const ItinerarySection = require('./templates/sections/itinerary');
const PricingSection = require('./templates/sections/pricing');
const HowToBook = require('./templates/sections/howToBook');
const VisaInfo = require('./templates/sections/visaInfo');
const PoliciesSection = require('./templates/sections/policies');

class PDFGenerator {
  constructor() {
    this.imageLoader = new ImageLoader();
  }

  /**
   * Generate complete itinerary PDF
   * @param {Object} data - PDF generation data
   * @param {Object} data.booking - Booking details from database
   * @param {Object} data.package - Package details (optional)
   * @param {Object} data.user - User details (optional)
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateItinerary({ booking, package: pkg, user }) {
    return new Promise(async (resolve, reject) => {
      try {
        // Initialize PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margins: pdfConfig.margins,
          bufferPages: true, // Enable page numbering
          info: {
            Title: `${branding.companyName} - Itinerary`,
            Author: branding.companyName,
            Subject: `Travel Itinerary - ${booking.bookingNumber}`,
            Creator: `${branding.companyName} PDF Generator`,
            Producer: 'PDFKit',
          }
        });

        // Collect PDF chunks into buffer
        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (error) => {
          console.error('PDF generation error:', error);
          reject(error);
        });

        // Register custom fonts
        this.registerFonts(doc);

        // Pre-load images for better performance
        const images = await this.preloadImages(pkg, booking);

        console.log('Starting PDF generation for booking:', booking.bookingNumber);

        // Render sections in order with error boundaries
        // Each section is wrapped in try-catch so one failure doesn't kill the entire PDF

        await this.renderSectionSafely(doc, 'CoverPage', async () => {
          await CoverPage.render(doc, { booking, package: pkg, images });
        });

        await this.renderSectionSafely(doc, 'BookingInfo', async () => {
          await BookingInfo.render(doc, { booking, user });
        });

        await this.renderSectionSafely(doc, 'Itinerary', async () => {
          await ItinerarySection.render(doc, { package: pkg, booking, images });
        });

        await this.renderSectionSafely(doc, 'Pricing', async () => {
          await PricingSection.render(doc, { booking });
        });

        await this.renderSectionSafely(doc, 'HowToBook', async () => {
          await HowToBook.render(doc, { booking });
        });

        await this.renderSectionSafely(doc, 'VisaInfo', async () => {
          await VisaInfo.render(doc, { package: pkg });
        });

        await this.renderSectionSafely(doc, 'Policies', async () => {
          await PoliciesSection.render(doc, { package: pkg, booking, images });
        });

        // Add page numbers to all pages
        this.addPageNumbers(doc);

        // Finalize the PDF
        doc.end();

        console.log('PDF generation completed successfully');
      } catch (error) {
        console.error('Failed to generate PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Register custom fonts with PDFKit
   * @private
   */
  registerFonts(doc) {
    const fontPath = path.join(__dirname, '../../../assets/fonts');
    const fontsToRegister = [
      { name: 'Poppins', file: 'Poppins-Regular.ttf' },
      { name: 'Poppins-Bold', file: 'Poppins-Bold.ttf' },
      { name: 'Poppins-SemiBold', file: 'Poppins-SemiBold.ttf' },
    ];

    let registeredCount = 0;

    for (const font of fontsToRegister) {
      try {
        const fullPath = path.join(fontPath, font.file);
        doc.registerFont(font.name, fullPath);
        registeredCount++;
      } catch (error) {
        console.warn(`Failed to register font ${font.name}:`, error.message);
        // Individual font failures don't stop other fonts from loading
      }
    }

    if (registeredCount === fontsToRegister.length) {
      console.log('All fonts registered successfully');
    } else if (registeredCount > 0) {
      console.log(`Registered ${registeredCount}/${fontsToRegister.length} fonts, using Helvetica fallback for missing fonts`);
    } else {
      console.warn('No custom fonts registered, using Helvetica fallback for all text');
    }
  }

  /**
   * Safely render a PDF section with error boundary
   * If the section fails, renders an error placeholder and continues
   * @private
   * @param {PDFDocument} doc - The PDF document
   * @param {string} sectionName - Name of the section for logging
   * @param {Function} renderFn - Async function that renders the section
   */
  async renderSectionSafely(doc, sectionName, renderFn) {
    try {
      await renderFn();
      console.log(`✓ ${sectionName} section rendered successfully`);
    } catch (error) {
      console.error(`✗ Error rendering ${sectionName} section:`, error.message);

      // Render error placeholder so PDF doesn't break
      try {
        doc.addPage();
        doc.font('Helvetica')
           .fontSize(14)
           .fillColor('#ef4444')
           .text(`Error loading ${sectionName} section`, 50, 50);

        doc.fontSize(10)
           .fillColor('#6b7280')
           .text('This section could not be rendered. Please contact support if this issue persists.', 50, 80, {
             width: doc.page.width - 100
           });

        doc.text(`Error: ${error.message}`, 50, 120, {
          width: doc.page.width - 100
        });
      } catch (placeholderError) {
        // Even the error placeholder failed - just log and continue
        console.error(`Failed to render error placeholder for ${sectionName}:`, placeholderError.message);
      }
    }
  }

  /**
   * Pre-load all images needed for the PDF
   * @private
   */
  async preloadImages(pkg, booking) {
    const images = {
      logo: null,
      packageImages: [],
      placeholder: null,
      curatorPhoto: null,
    };

    try {
      // Load company logo
      images.logo = await this.imageLoader.loadLogo();

      // Load placeholder for missing images
      images.placeholder = await this.imageLoader.loadPlaceholder();

      // Load package images if available
      if (pkg && pkg.images && pkg.images.length > 0) {
        const imageUrls = pkg.images.slice(0, 5); // Limit to 5 images
        images.packageImages = await this.imageLoader.loadMultiple(imageUrls);
      }

      // Load curator photo if curator assigned
      if (booking && booking.curator && booking.curator.photoUrl) {
        try {
          images.curatorPhoto = await this.imageLoader.loadFromUrl(booking.curator.photoUrl);
          console.log('Curator photo loaded successfully');
        } catch (error) {
          console.warn('Failed to load curator photo, will use initials placeholder:', error.message);
          images.curatorPhoto = null;
        }
      }

      console.log('Images preloaded:', {
        hasLogo: !!images.logo,
        packageImageCount: images.packageImages.filter(img => img !== null).length,
        hasPlaceholder: !!images.placeholder,
        hasCuratorPhoto: !!images.curatorPhoto,
      });
    } catch (error) {
      console.error('Error preloading images:', error.message);
    }

    return images;
  }

  /**
   * Add page numbers to footer of all pages
   * CRITICAL: Must prevent PDFKit from auto-creating pages during text rendering
   * @private
   */
  addPageNumbers(doc) {
    const pageCount = doc.bufferedPageRange().count;

    console.log(`📄 Adding footers to ${pageCount} pages`);

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      // Save current Y position to restore after footer
      const savedY = doc.y;

      // ========== LEFT DECORATIVE BAR ==========
      // Vertical teal bar on left edge
      doc.rect(0, doc.page.height - 60, 3, 60)
         .fill(colors.primary);

      // Rotated "TRIP & EVENT" text on left edge (optional decorative element)
      doc.save();
      doc.rotate(90, { origin: [15, doc.page.height - 30] });
      doc.font('Helvetica-Bold')
         .fontSize(7)
         .fillColor(colors.gray400)
         .text('TRIP & EVENT', -20, doc.page.height - 33, {
           lineBreak: false
         });
      doc.restore();

      // ========== FOOTER LINE (with gradient effect) ==========
      // Main line
      doc.moveTo(50, doc.page.height - 50)
         .lineTo(doc.page.width - 50, doc.page.height - 50)
         .strokeColor(colors.gray300)
         .lineWidth(0.5)
         .stroke();

      // Decorative accent line (thicker, primary color, centered)
      const accentLineWidth = 60;
      const accentLineX = (doc.page.width - accentLineWidth) / 2;
      doc.moveTo(accentLineX, doc.page.height - 50)
         .lineTo(accentLineX + accentLineWidth, doc.page.height - 50)
         .strokeColor(colors.primary)
         .lineWidth(1.5)
         .stroke();

      // ========== PAGE NUMBER (centered manually) ==========
      const pageNumberText = `Page ${i + 1} of ${pageCount}`;

      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(colors.gray500);

      // Calculate center position manually (CRITICAL: prevents layout engine from creating pages)
      const pageNumWidth = doc.widthOfString(pageNumberText);
      const pageNumX = (doc.page.width - pageNumWidth) / 2;

      // Render with lineBreak: false to prevent auto-page-creation
      doc.text(
        pageNumberText,
        pageNumX,
        doc.page.height - 40,
        {
          lineBreak: false, // CRITICAL: Prevents PDFKit from creating new pages
          continued: false
        }
      );

      // ========== COMPANY INFO (centered manually) ==========
      const companyText = `${branding.companyName} | ${branding.phone} | ${branding.website}`;

      doc.fontSize(8)
         .fillColor(colors.gray400);

      // Calculate center position manually
      const companyWidth = doc.widthOfString(companyText);
      const companyX = (doc.page.width - companyWidth) / 2;

      // Render with lineBreak: false to prevent auto-page-creation
      doc.text(
        companyText,
        companyX,
        doc.page.height - 25,
        {
          lineBreak: false, // CRITICAL: Prevents PDFKit from creating new pages
          continued: false
        }
      );

      // ========== RIGHT DECORATIVE ELEMENT ==========
      // Small teal square on right edge
      doc.rect(doc.page.width - 3, doc.page.height - 60, 3, 60)
         .fill(colors.primaryLight);

      // Small decorative circle (optional accent)
      doc.circle(doc.page.width - 20, doc.page.height - 30, 4)
         .fill(colors.primary);

      // Restore Y position to prevent footer rendering from affecting document flow
      doc.y = savedY;
    }

    const finalPageCount = doc.bufferedPageRange().count;
    console.log(`✅ Footer rendering complete. Pages: ${pageCount} → ${finalPageCount} (should be same)`);

    // Verify no extra pages were created
    if (finalPageCount !== pageCount) {
      console.error(`❌ ERROR: Footer rendering created ${finalPageCount - pageCount} extra pages!`);
    }
  }

  /**
   * Render temporary cover page (until actual sections are implemented)
   * @private
   */
  renderTemporaryCover(doc, { booking, package: pkg }) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Teal gradient background (simulated with rectangles)
    doc.rect(0, 0, pageWidth, 300).fill(colors.primary);
    doc.rect(0, 300, pageWidth, 100).fill(colors.primaryLight);

    // Company name
    try {
      doc.font('Poppins-Bold');
    } catch {
      doc.font('Helvetica-Bold');
    }

    doc.fontSize(36)
       .fillColor(colors.white)
       .text(branding.companyName, 0, 100, { align: 'center', width: pageWidth });

    // Tagline
    try {
      doc.font('Poppins');
    } catch {
      doc.font('Helvetica');
    }

    doc.fontSize(14)
       .fillColor(colors.white)
       .text(branding.tagline, 0, 150, { align: 'center', width: pageWidth });

    // Subtitle
    doc.fontSize(12)
       .fillColor(colors.white)
       .text(branding.subtitle || "World's First CineMatrip Brand", 0, 175, { align: 'center', width: pageWidth });

    // Package title (if available)
    if (pkg && pkg.title) {
      try {
        doc.font('Poppins-SemiBold');
      } catch {
        doc.font('Helvetica-Bold');
      }

      doc.fontSize(28)
         .fillColor(colors.white)
         .text(pkg.title, 60, 240, { align: 'center', width: pageWidth - 120 });
    }

    // Booking reference card
    const cardY = 420;
    doc.roundedRect(70, cardY, pageWidth - 140, 150, 10)
       .fill(colors.white);

    doc.fillColor(colors.gray700)
       .fontSize(14)
       .text('Booking Reference', 90, cardY + 20);

    try {
      doc.font('Poppins-Bold');
    } catch {
      doc.font('Helvetica-Bold');
    }

    doc.fontSize(24)
       .fillColor(colors.primary)
       .text(booking.bookingNumber || 'N/A', 90, cardY + 50);

    // Booking details
    try {
      doc.font('Poppins');
    } catch {
      doc.font('Helvetica');
    }

    doc.fontSize(11)
       .fillColor(colors.gray600)
       .text(`Status: ${booking.status}`, 90, cardY + 90);

    doc.text(
      `Total Amount: ₹${booking.totalAmount?.toLocaleString('en-IN') || '0'}`,
      90,
      cardY + 110
    );

    // Footer note
    doc.fontSize(10)
       .fillColor(colors.gray500)
       .text(
         'This is a temporary cover page. Full PDF sections will be implemented next.',
         50,
         pageHeight - 100,
         { align: 'center', width: pageWidth - 100 }
       );
  }

  /**
   * Get cache statistics from image loader
   */
  getCacheStats() {
    return this.imageLoader.getCacheStats();
  }

  /**
   * Clear image cache
   */
  clearCache() {
    this.imageLoader.clearCache();
  }
}

module.exports = PDFGenerator;
