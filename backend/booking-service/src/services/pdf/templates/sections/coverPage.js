/**
 * Cover Page Section
 * Renders the first page of the itinerary PDF with branding and key booking info
 */

const { colors, fonts, fontSize, branding, spacing } = require('../../../../config/pdf.config');

class CoverPage {
  /**
   * Render the cover page
   * @param {PDFDocument} doc - PDFKit document instance
   * @param {Object} data - Rendering data
   * @param {Object} data.booking - Booking details
   * @param {Object} data.package - Package details (optional)
   * @param {Object} data.images - Pre-loaded images
   */
  static async render(doc, { booking, package: pkg, images }) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // ========== TOP SECTION: Gradient Background ==========
    // Primary teal gradient (simulated with layered rectangles)
    doc.rect(0, 0, pageWidth, 350)
       .fill(colors.primary);

    // Lighter teal overlay for gradient effect
    doc.rect(0, 250, pageWidth, 100)
       .fillOpacity(0.3)
       .fill(colors.primaryLight)
       .fillOpacity(1);

    // ========== LOGO ==========
    if (images.logo) {
      try {
        // Render logo at top-left of cover page
        doc.image(images.logo, 50, 30, {
          width: 120,
          height: 60,
          fit: [120, 60],
          align: 'left'
        });
        console.log('✅ Logo rendered successfully on cover page');
      } catch (error) {
        console.error('❌ Failed to render logo on cover page:', error);
      }
    } else {
      console.warn('⚠️ Logo image not loaded');
    }

    // ========== COMPANY BRANDING ==========
    // Company name
    doc.font(fonts.bold)
       .fontSize(fontSize.h1 + 8)
       .fillColor(colors.white)
       .text(branding.companyName, 0, 120, {
         align: 'center',
         width: pageWidth
       });

    // Tagline
    doc.font(fonts.primary)
       .fontSize(fontSize.h4)
       .fillColor(colors.white)
       .text(branding.tagline, 0, 160, {
         align: 'center',
         width: pageWidth
       });

    // Subtitle
    doc.fontSize(fontSize.body)
       .fillColor(colors.white)
       .fillOpacity(0.9)
       .text(branding.subtitle || "World's First CineMatrip Brand", 0, 185, {
         align: 'center',
         width: pageWidth
       })
       .fillOpacity(1);

    // ========== PACKAGE TITLE ==========
    if (pkg && pkg.title) {
      doc.font(fonts.bold)
         .fontSize(32)
         .fillColor(colors.white)
         .text(pkg.title, 60, 245, {
           align: 'center',
           width: pageWidth - 120,
           lineGap: 4
         });

      // Package tagline/quote (below title, italic)
      if (pkg.tagline) {
        doc.font(fonts.primary)
           .fontSize(fontSize.body)
           .fillColor(colors.white)
           .fillOpacity(0.85)
           .text(`"${pkg.tagline}"`, 60, 290, {
             align: 'center',
             width: pageWidth - 120,
             oblique: true // Italic effect
           })
           .fillOpacity(1);
      }
    }

    // ========== HIGHLIGHTS SUMMARY STRIP ==========
    // Show key package features with icons (only if data exists)
    const highlightsY = 325;
    this.renderHighlightsStrip(doc, pkg, booking, highlightsY, pageWidth);

    // ========== BOOKING REFERENCE CARD ==========
    const cardY = 390;
    const cardHeight = 200;
    const cardPadding = 20;

    // Card shadow (simulated)
    doc.rect(75, cardY + 5, pageWidth - 150, cardHeight)
       .fillOpacity(0.1)
       .fill(colors.gray900)
       .fillOpacity(1);

    // Main card
    doc.roundedRect(70, cardY, pageWidth - 140, cardHeight, 12)
       .fill(colors.white);

    // Card content
    let cardContentY = cardY + cardPadding;

    // "Booking Reference" label
    doc.font(fonts.semibold)
       .fontSize(fontSize.h4)
       .fillColor(colors.gray700)
       .text('Booking Reference', 90, cardContentY);

    cardContentY += 30;

    // Booking number (large, highlighted)
    doc.font(fonts.bold)
       .fontSize(fontSize.h2 + 4)
       .fillColor(colors.primary)
       .text(booking.bookingNumber || 'N/A', 90, cardContentY);

    cardContentY += 45;

    // Booking details grid
    const detailsStartY = cardContentY;
    const leftColX = 90;
    const rightColX = pageWidth / 2 + 20;

    // Status
    this.renderDetail(doc, 'Status', booking.status || 'PENDING', leftColX, detailsStartY);

    // Booking date
    const bookingDate = booking.createdAt
      ? new Date(booking.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : 'N/A';
    this.renderDetail(doc, 'Booked On', bookingDate, rightColX, detailsStartY);

    // Total amount
    const totalAmount = booking.totalAmount
      ? `₹${booking.totalAmount.toLocaleString('en-IN')}`
      : 'N/A';
    this.renderDetail(doc, 'Total Amount', totalAmount, leftColX, detailsStartY + 40);

    // Travelers count
    const travelerCount = booking.travelers?.length || booking.numTravelers || 0;
    this.renderDetail(doc, 'Travelers', `${travelerCount} Person${travelerCount !== 1 ? 's' : ''}`, rightColX, detailsStartY + 40);

    // ========== TABLE OF CONTENTS CARD ==========
    const tocCardY = cardY + cardHeight + spacing.lg;
    this.renderTableOfContents(doc, pkg, tocCardY, pageWidth);

    // ========== CURATED BY SECTION ==========
    const curatedByY = tocCardY + 240; // Below TOC card
    const curatedCardHeight = 120; // Height of curated by card
    this.renderCuratedBySection(doc, booking, images, curatedByY, pageWidth);

    // Sync doc.y to reflect actual content position
    doc.y = curatedByY + curatedCardHeight + spacing.md;

    // Cover page is complete - add new page for next section
    // This is necessary so subsequent sections start on a fresh page
    doc.addPage();
  }

  /**
   * Render highlights summary strip with icons
   * Shows key package features: Hotel, Activities, Transfers, Visa, Meals
   * @private
   */
  static renderHighlightsStrip(doc, pkg, booking, y, pageWidth) {
    // Only show if we have package data
    if (!pkg) return;

    const stripHeight = 60;
    const iconSize = 24;
    const features = [];

    // Determine which features are included based on package data
    if (pkg.accommodation || pkg.hotel) {
      features.push({ label: 'Hotel', icon: 'H' });
    }
    if (pkg.itinerary && pkg.itinerary.length > 0) {
      const hasActivities = pkg.itinerary.some(day => day.activities && day.activities.length > 0);
      if (hasActivities) {
        features.push({ label: 'Activities', icon: 'A' });
      }
    }
    if (pkg.transfers || (pkg.inclusions && pkg.inclusions.some(inc => inc.toLowerCase().includes('transfer')))) {
      features.push({ label: 'Transfers', icon: 'T' });
    }
    if (pkg.visaRequired) {
      features.push({ label: 'Visa', icon: 'V' });
    }
    if (pkg.meals || (pkg.inclusions && pkg.inclusions.some(inc => inc.toLowerCase().includes('meal')))) {
      features.push({ label: 'Meals', icon: 'M' });
    }

    // Only render if we have features to show
    if (features.length === 0) return;

    // Calculate spacing
    const totalWidth = pageWidth - 140;
    const featureSpacing = totalWidth / features.length;

    features.forEach((feature, index) => {
      const x = 70 + (index * featureSpacing) + (featureSpacing / 2);

      // Icon circle background
      doc.circle(x, y + 20, iconSize / 2)
         .fill(colors.white)
         .fillOpacity(0.2);

      doc.circle(x, y + 20, iconSize / 2)
         .strokeColor(colors.white)
         .lineWidth(2)
         .stroke();

      // Icon letter
      doc.font(fonts.bold)
         .fontSize(fontSize.body)
         .fillColor(colors.white)
         .text(feature.icon, x - 5, y + 13, {
           width: 10,
           align: 'center',
           lineBreak: false
         });

      // Label
      doc.font(fonts.primary)
         .fontSize(fontSize.tiny)
         .fillColor(colors.white)
         .fillOpacity(0.9)
         .text(feature.label, x - 30, y + 40, {
           width: 60,
           align: 'center'
         })
         .fillOpacity(1);
    });
  }

  /**
   * Render Table of Contents card
   * @private
   */
  static renderTableOfContents(doc, pkg, y, pageWidth) {
    const cardWidth = pageWidth - 140;
    const cardHeight = 220;
    const cardX = 70;
    const cardPadding = 20;

    // Card shadow
    doc.rect(cardX + 5, y + 5, cardWidth, cardHeight)
       .fillOpacity(0.1)
       .fill(colors.gray900)
       .fillOpacity(1);

    // Main card
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 12)
       .fill(colors.white);

    // Card header
    doc.font(fonts.bold)
       .fontSize(fontSize.h4)
       .fillColor(colors.gray900)
       .text('Table of Contents', cardX + cardPadding, y + cardPadding);

    // Decorative line
    doc.moveTo(cardX + cardPadding, y + cardPadding + 25)
       .lineTo(cardX + 60, y + cardPadding + 25)
       .strokeColor(colors.primary)
       .lineWidth(2)
       .stroke();

    // Contents list (auto-generated page numbers will be updated based on actual rendering)
    const contents = [
      { title: 'Your Itinerary Overview', page: 2 },
      { title: 'Day-Wise Details', page: 3 },
      { title: 'Package Highlights & Pricing', page: pkg?.itinerary?.length ? pkg.itinerary.length + 3 : 8 },
      { title: 'Cancellation & Policies', page: pkg?.itinerary?.length ? pkg.itinerary.length + 5 : 10 },
      { title: 'How to Book', page: pkg?.itinerary?.length ? pkg.itinerary.length + 6 : 11 }
    ];

    let contentY = y + cardPadding + 45;

    contents.forEach((item, index) => {
      // Number
      doc.font(fonts.semibold)
         .fontSize(fontSize.body)
         .fillColor(colors.primary)
         .text(`${index + 1}.`, cardX + cardPadding, contentY, {
           width: 20,
           lineBreak: false
         });

      // Title
      doc.font(fonts.primary)
         .fontSize(fontSize.body)
         .fillColor(colors.gray800)
         .text(item.title, cardX + cardPadding + 25, contentY, {
           width: cardWidth - 100,
           lineBreak: false
         });

      // Page number (right-aligned)
      doc.font(fonts.semibold)
         .fontSize(fontSize.body)
         .fillColor(colors.gray600)
         .text(`${item.page}`, cardX + cardWidth - 40, contentY, {
           width: 20,
           align: 'right',
           lineBreak: false
         });

      contentY += 28;
    });

    // Border
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 12)
       .strokeColor(colors.gray300)
       .lineWidth(1)
       .stroke();
  }

  /**
   * Render Curated By section with curator details
   * @private
   */
  static renderCuratedBySection(doc, booking, images, y, pageWidth) {
    const cardWidth = 280;
    const cardHeight = 120;
    const cardX = 70;
    const cardPadding = 15;

    // Get curator info (from booking or use default)
    const curator = booking.curator || {
      name: `${branding.companyName} Team`,
      phone: branding.phone,
      email: branding.email
    };

    // Card background
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 10)
       .fill(colors.primaryBg);

    // Profile section
    const photoSize = 45;
    const photoX = cardX + cardPadding;
    const photoY = y + cardPadding;

    // Profile photo or initials placeholder
    const hasPhoto = images && images.curatorPhoto;

    if (hasPhoto) {
      try {
        // Render curator photo in circular clip
        doc.save();
        doc.circle(photoX + (photoSize / 2), photoY + (photoSize / 2), photoSize / 2)
           .clip();

        doc.image(images.curatorPhoto, photoX, photoY, {
          width: photoSize,
          height: photoSize,
          fit: [photoSize, photoSize]
        });

        doc.restore();

        // Photo border
        doc.circle(photoX + (photoSize / 2), photoY + (photoSize / 2), photoSize / 2)
           .strokeColor(colors.primary)
           .lineWidth(2)
           .stroke();
      } catch (error) {
        console.warn('Failed to render curator photo:', error.message);
        // Fallback to initials
        this.renderCuratorInitials(doc, curator.name, photoX, photoY, photoSize);
      }
    } else {
      // Initials placeholder
      this.renderCuratorInitials(doc, curator.name, photoX, photoY, photoSize);
    }

    // Curator details (right of photo)
    const detailsX = photoX + photoSize + 12;

    // Label
    doc.font(fonts.primary)
       .fontSize(fontSize.tiny)
       .fillColor(colors.gray600)
       .text('Your Travel Curator', detailsX, photoY);

    // Curator name
    doc.font(fonts.bold)
       .fontSize(fontSize.h5)
       .fillColor(colors.gray900)
       .text(curator.name, detailsX, photoY + 14, {
         width: cardWidth - photoSize - cardPadding - 30,
         ellipsis: true
       });

    // Contact info
    const contactY = photoY + 36;

    doc.font(fonts.primary)
       .fontSize(fontSize.tiny)
       .fillColor(colors.gray700)
       .text(`Phone: ${curator.phone || branding.phone}`, detailsX, contactY);

    doc.text(`Email: ${curator.email || branding.email}`, detailsX, contactY + 14, {
      width: cardWidth - photoSize - cardPadding - 30,
      ellipsis: true
    });

    // Footer text
    doc.font(fonts.primary)
       .fontSize(fontSize.tiny)
       .fillColor(colors.gray500)
       .text('We are here to assist you!', cardX + cardPadding, y + cardHeight - 25, {
         width: cardWidth - (cardPadding * 2),
         align: 'center',
         oblique: true
       });

    // Card border
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 10)
       .strokeColor(colors.primary)
       .lineWidth(1.5)
       .stroke();
  }

  /**
   * Render curator initials placeholder
   * @private
   */
  static renderCuratorInitials(doc, name, x, y, size) {
    const initials = this.getInitials(name);

    // Circle background
    doc.circle(x + (size / 2), y + (size / 2), size / 2)
       .fill(colors.primary);

    // Initials text
    doc.font(fonts.bold)
       .fontSize(size / 2.5)
       .fillColor(colors.white)
       .text(initials, x, y + (size / 3), {
         width: size,
         align: 'center',
         lineBreak: false
       });

    // Circle border
    doc.circle(x + (size / 2), y + (size / 2), size / 2)
       .strokeColor(colors.primary)
       .lineWidth(2)
       .stroke();
  }

  /**
   * Get initials from full name
   * @private
   */
  static getInitials(name) {
    if (!name) return 'T&E';

    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Helper: Render a detail row (label + value)
   * @private
   */
  static renderDetail(doc, label, value, x, y) {
    // Label
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.gray500)
       .text(label, x, y);

    // Value
    doc.font(fonts.semibold)
       .fontSize(fontSize.body)
       .fillColor(colors.gray900)
       .text(value, x, y + 14);
  }
}

module.exports = CoverPage;
