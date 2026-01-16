/**
 * Policies Section
 * Renders cancellation policy, date change policy, and terms & conditions
 */

const { colors, fonts, fontSize, spacing, policies, branding, curator: curatorConfig } = require('../../../../config/pdf.config');

class PoliciesSection {
  /**
   * Render the policies section
   * @param {PDFDocument} doc - PDFKit document instance
   * @param {Object} data - Rendering data
   * @param {Object} data.package - Package details (optional)
   * @param {Object} data.booking - Booking details
   * @param {Object} data.images - Pre-loaded images (optional)
   */
  static async render(doc, { package: pkg, booking, images }) {
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;
    const contentWidth = pageWidth - (margin * 2);

    let currentY = doc.y;

    // ========== CANCELLATION POLICY ==========
    currentY = this.renderSectionHeader(doc, 'Cancellation Policy', margin, currentY);
    currentY += spacing.md;

    currentY = this.renderCancellationPolicy(doc, margin, currentY, contentWidth);

    currentY += spacing.xl;

    // ========== DATE CHANGE POLICY ==========
    // Check if we need a new page
    if (currentY > doc.page.height - doc.page.margins.bottom - 250) {
      doc.addPage();
      currentY = doc.page.margins.top;
    }

    currentY = this.renderSectionHeader(doc, 'Date Change Policy', margin, currentY);
    currentY += spacing.md;

    currentY = this.renderDateChangePolicy(doc, margin, currentY, contentWidth);

    currentY += spacing.xl;

    // ========== TERMS & CONDITIONS ==========
    // Check if we need a new page
    if (currentY > doc.page.height - doc.page.margins.bottom - 300) {
      doc.addPage();
      currentY = doc.page.margins.top;
    }

    currentY = this.renderSectionHeader(doc, 'Terms & Conditions', margin, currentY);
    currentY += spacing.md;

    currentY = this.renderTermsAndConditions(doc, margin, currentY, contentWidth);

    // ========== GET IN TOUCH - FULL PAGE ==========
    // Check if we need a new page for Get in Touch
    if (currentY > doc.page.height - doc.page.margins.bottom - 500) {
      doc.addPage();
      currentY = doc.page.margins.top;
    }
    // Continue on same page if there's space

    this.renderGetInTouchPage(doc, booking, images, margin, currentY, contentWidth);
  }

  /**
   * Render section header
   * @private
   */
  static renderSectionHeader(doc, title, x, y = null) {
    const startY = y !== null ? y : doc.y;

    // Decorative line
    doc.moveTo(x, startY + 10)
       .lineTo(x + 40, startY + 10)
       .strokeColor(colors.primary)
       .lineWidth(3)
       .stroke();

    // Title
    doc.font(fonts.bold)
       .fontSize(fontSize.h3)
       .fillColor(colors.gray900)
       .text(title, x + 50, startY, {
         lineBreak: false
       });

    return startY + 35;
  }

  /**
   * Render cancellation policy timeline
   * @private
   */
  static renderCancellationPolicy(doc, x, y, width) {
    let currentY = y;

    // Policy description
    doc.font(fonts.primary)
       .fontSize(fontSize.body)
       .fillColor(colors.gray700)
       .text(
         'Cancellation charges are calculated from the date of departure as follows:',
         x,
         currentY,
         { width, lineGap: 3 }
       );

    currentY = doc.y + spacing.md;

    // ========== HORIZONTAL TIMELINE VISUALIZATION ==========
    const timeline = policies.cancellation.timeline;
    const timelineHeight = 120;
    const arrowWidth = 10;
    const iconCircleRadius = 16; // Status icon above timeline
    const statusIconSpacing = 30; // Space above timeline for status icons
    const dateExampleSpacing = 35; // Space below timeline for date examples
    const totalArrowSpace = (timeline.length - 1) * arrowWidth;
    const zoneWidth = (width - totalArrowSpace) / timeline.length;

    // Check if we need a new page for timeline (now taller with icons and dates)
    if (currentY + statusIconSpacing + timelineHeight + dateExampleSpacing + 100 > doc.page.height - doc.page.margins.bottom - 80) {
      doc.addPage();
      currentY = doc.page.margins.top;
    }

    const timelineStartY = currentY + statusIconSpacing; // Leave space for status icons

    // ========== STATUS ICONS ABOVE TIMELINE ==========
    timeline.forEach((zone, index) => {
      const zoneX = x + (index * (zoneWidth + arrowWidth));
      const iconCenterX = zoneX + (zoneWidth / 2);
      const iconCenterY = currentY + iconCircleRadius;

      // Determine icon type based on refund percentage
      const isFullRefund = zone.refund.includes('100%');
      const isPartialRefund = zone.refund.includes('%') && !zone.refund.includes('100%') && !zone.refund.includes('No');
      const isNoRefund = zone.refund.includes('No refund');

      // Status circle background
      if (isFullRefund) {
        // Green checkmark circle
        doc.circle(iconCenterX, iconCenterY, iconCircleRadius)
           .fill(colors.success);

        doc.font(fonts.bold)
           .fontSize(fontSize.body)
           .fillColor(colors.white)
           .text('✓', iconCenterX - 6, iconCenterY - 7, {
             lineBreak: false
           });
      } else if (isPartialRefund) {
        // Yellow/amber checkmark circle
        doc.circle(iconCenterX, iconCenterY, iconCircleRadius)
           .fill(colors.warning);

        doc.font(fonts.bold)
           .fontSize(fontSize.body)
           .fillColor(colors.white)
           .text('✓', iconCenterX - 6, iconCenterY - 7, {
             lineBreak: false
           });
      } else {
        // Red X circle
        doc.circle(iconCenterX, iconCenterY, iconCircleRadius)
           .fill(colors.error);

        doc.font(fonts.bold)
           .fontSize(fontSize.body)
           .fillColor(colors.white)
           .text('×', iconCenterX - 6, iconCenterY - 7, {
             lineBreak: false
           });
      }

      // White border around icon
      doc.circle(iconCenterX, iconCenterY, iconCircleRadius)
         .strokeColor(colors.white)
         .lineWidth(2)
         .stroke();
    });

    // ========== TIMELINE ZONES ==========
    timeline.forEach((zone, index) => {
      const zoneX = x + (index * (zoneWidth + arrowWidth));

      // Zone background (rounded rectangle with zone color)
      doc.roundedRect(zoneX, timelineStartY, zoneWidth, timelineHeight, 8)
         .fill(zone.color);

      // Period label (top section)
      doc.font(fonts.semibold)
         .fontSize(fontSize.small)
         .fillColor(colors.white)
         .text(
           zone.period,
           zoneX + 8,
           timelineStartY + 15,
           {
             width: zoneWidth - 16,
             align: 'center',
             lineGap: 2
           }
         );

      // Refund percentage (center section - large and bold)
      const refundY = timelineStartY + 55;
      doc.font(fonts.bold)
         .fontSize(fontSize.h2)
         .fillColor(colors.white)
         .text(
           zone.refund,
           zoneX + 8,
           refundY,
           {
             width: zoneWidth - 16,
             align: 'center'
           }
         );

      // Arrow connector (if not last zone)
      if (index < timeline.length - 1) {
        const arrowX = zoneX + zoneWidth;
        const arrowCenterY = timelineStartY + (timelineHeight / 2);

        // Draw right-pointing triangle
        doc.polygon(
          [arrowX, arrowCenterY - 10],
          [arrowX + arrowWidth, arrowCenterY],
          [arrowX, arrowCenterY + 10]
        )
        .fill(colors.gray300);
      }
    });

    // ========== DATE EXAMPLES BELOW TIMELINE ==========
    const dateExampleY = timelineStartY + timelineHeight + 12;

    timeline.forEach((zone, index) => {
      const zoneX = x + (index * (zoneWidth + arrowWidth));

      // Generate example date
      let exampleDate = '';
      const today = new Date();
      const departureDate = new Date(today);
      departureDate.setDate(departureDate.getDate() + 60); // Assume departure in 60 days

      if (zone.period.includes('More than 30')) {
        const exampleDeparture = new Date(departureDate);
        exampleDeparture.setDate(exampleDeparture.getDate() - 35);
        exampleDate = `e.g., Before ${exampleDeparture.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
      } else if (zone.period.includes('15-30')) {
        const exampleDeparture = new Date(departureDate);
        exampleDeparture.setDate(exampleDeparture.getDate() - 20);
        exampleDate = `e.g., ${exampleDeparture.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
      } else if (zone.period.includes('7-15')) {
        const exampleDeparture = new Date(departureDate);
        exampleDeparture.setDate(exampleDeparture.getDate() - 10);
        exampleDate = `e.g., ${exampleDeparture.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
      } else {
        const exampleDeparture = new Date(departureDate);
        exampleDeparture.setDate(exampleDeparture.getDate() - 3);
        exampleDate = `e.g., ${exampleDeparture.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
      }

      // Render date example
      doc.font(fonts.primary)
         .fontSize(fontSize.tiny)
         .fillColor(colors.gray600)
         .text(
           exampleDate,
           zoneX + 8,
           dateExampleY,
           {
             width: zoneWidth - 16,
             align: 'center',
             lineBreak: false
           }
         );
    });

    currentY = timelineStartY + timelineHeight + dateExampleSpacing + spacing.lg;

    // Policy notes
    currentY += spacing.md;

    doc.font(fonts.semibold)
       .fontSize(fontSize.h5)
       .fillColor(colors.gray700)
       .text('Important Notes:', x, currentY);

    currentY += 20;

    policies.cancellation.notes.forEach(note => {
      // Bullet point
      doc.fillColor(colors.gray400)
         .circle(x + 5, currentY + 7, 2)
         .fill();

      // Note text
      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray600)
         .text(note, x + 15, currentY, {
           width: width - 20,
           lineGap: 2
         });

      currentY = doc.y + 8;
    });

    return currentY;
  }

  /**
   * Render date change policy
   * @private
   */
  static renderDateChangePolicy(doc, x, y, width) {
    let currentY = y;

    // Policy description
    doc.font(fonts.primary)
       .fontSize(fontSize.body)
       .fillColor(colors.gray700)
       .text(
         'Date changes are subject to availability and the following charges:',
         x,
         currentY,
         { width, lineGap: 3 }
       );

    currentY = doc.y + spacing.md;

    // ========== HORIZONTAL TIMELINE VISUALIZATION ==========
    const timeline = policies.dateChange.timeline;
    const timelineHeight = 110;
    const arrowWidth = 10;
    const totalArrowSpace = (timeline.length - 1) * arrowWidth;
    const zoneWidth = (width - totalArrowSpace) / timeline.length;

    // Check if we need a new page for timeline
    if (currentY + timelineHeight + 80 > doc.page.height - doc.page.margins.bottom - 80) {
      doc.addPage();
      currentY = doc.page.margins.top;
    }

    const timelineStartY = currentY;

    timeline.forEach((zone, index) => {
      const zoneX = x + (index * (zoneWidth + arrowWidth));

      // Determine zone color based on fee
      let zoneColor;
      if (zone.fee === 'Not allowed') {
        zoneColor = colors.error; // Red for not allowed
      } else if (index === 0) {
        zoneColor = colors.success; // Green for earliest/cheapest
      } else {
        zoneColor = colors.warning; // Amber for middle zone
      }

      // Zone background (rounded rectangle)
      doc.roundedRect(zoneX, currentY, zoneWidth, timelineHeight, 8)
         .fill(zoneColor);

      // Period label (top section)
      doc.font(fonts.semibold)
         .fontSize(fontSize.small)
         .fillColor(colors.white)
         .text(
           zone.period,
           zoneX + 8,
           currentY + 15,
           {
             width: zoneWidth - 16,
             align: 'center',
             lineGap: 2
           }
         );

      // Fee amount (center section - large and bold)
      const feeY = currentY + 50;
      doc.font(fonts.bold)
         .fontSize(zone.fee === 'Not allowed' ? fontSize.h4 : fontSize.h3)
         .fillColor(colors.white)
         .text(
           zone.fee,
           zoneX + 8,
           feeY,
           {
             width: zoneWidth - 16,
             align: 'center',
             lineGap: 2
           }
         );

      // Arrow connector (if not last zone)
      if (index < timeline.length - 1) {
        const arrowX = zoneX + zoneWidth;
        const arrowCenterY = currentY + (timelineHeight / 2);

        // Draw right-pointing triangle
        doc.polygon(
          [arrowX, arrowCenterY - 10],
          [arrowX + arrowWidth, arrowCenterY],
          [arrowX, arrowCenterY + 10]
        )
        .fill(colors.gray300);
      }
    });

    currentY += timelineHeight + spacing.lg;

    // Note
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.gray600)
       .text(
         'Note: Date changes are subject to availability. Fare difference, if any, will be charged separately.',
         x,
         currentY,
         { width, italic: true, lineGap: 2 }
       );

    currentY = doc.y;

    return currentY;
  }

  /**
   * Render terms and conditions
   * @private
   */
  static renderTermsAndConditions(doc, x, y, width) {
    let currentY = y;

    // Introductory text
    doc.font(fonts.primary)
       .fontSize(fontSize.body)
       .fillColor(colors.gray700)
       .text(
         'Please read the following terms and conditions carefully before confirming your booking:',
         x,
         currentY,
         { width, lineGap: 3 }
       );

    currentY = doc.y + spacing.md;

    // Terms list
    const terms = policies.termsAndConditions;

    terms.forEach((term, index) => {
      // Check if we need a new page
      if (currentY > doc.page.height - doc.page.margins.bottom - 120) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      // Term number (left aligned, fixed width)
      doc.font(fonts.semibold)
         .fontSize(fontSize.body)
         .fillColor(colors.primary)
         .text(`${index + 1}.`, x, currentY, {
           width: 20,
           align: 'left',
           lineBreak: false // Don't wrap the number
         });

      // Term text (right side, with proper width)
      doc.font(fonts.primary)
         .fillColor(colors.gray800)
         .text(term, x + 25, currentY, {
           width: width - 30,
           align: 'left',
           lineGap: 2
         });

      currentY = doc.y + 15; // Update Y position with spacing
    });

    return currentY;
  }

  /**
   * Render curator profile card with contact details
   * @private
   */
  static renderCuratorCard(doc, booking, images, x, y, width) {
    const cardHeight = 200;
    const cardPadding = 20;

    // Card background
    doc.roundedRect(x, y, width, cardHeight, 10)
       .fill(colors.primaryBg);

    // ========== PROFILE SECTION ==========
    const profileY = y + cardPadding;
    const photoSize = 70;
    const photoX = x + cardPadding;
    const photoY = profileY;

    // Get curator info (from booking or use default)
    const curator = booking.curator || {
      name: branding.companyName + ' Team',
      title: curatorConfig.defaultTitle,
      message: curatorConfig.defaultMessage,
      phone: branding.phone,
      email: branding.email,
      availability: curatorConfig.defaultAvailability
    };

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
    const detailsX = photoX + photoSize + 20;
    const detailsWidth = width - photoSize - (cardPadding * 2) - 20;

    // Label
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.gray600)
       .text('Your Travel Expert', detailsX, profileY);

    // Curator name
    doc.font(fonts.bold)
       .fontSize(fontSize.h4)
       .fillColor(colors.gray900)
       .text(curator.name, detailsX, profileY + 18, {
         width: detailsWidth,
         ellipsis: true
       });

    // Curator title
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.gray600)
       .text(curator.title, detailsX, profileY + 40);

    // Personal message
    if (curator.message) {
      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray700)
         .text(`"${curator.message}"`, detailsX, profileY + 58, {
           width: detailsWidth,
           italic: true,
           lineGap: 2
         });
    }

    // ========== CONTACT DETAILS SECTION ==========
    const contactY = y + cardPadding + 110;

    // Contact details in a row
    const contactDetails = [
      { icon: '•', label: 'Phone', value: curator.phone || branding.phone },
      { icon: '•', label: 'Email', value: curator.email || branding.email },
      { icon: '•', label: 'Available', value: curator.availability || '24/7' }
    ];

    contactDetails.forEach((detail, index) => {
      const detailY = contactY + (index * 18);

      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray600)
         .text(`${detail.icon} ${detail.label}: `, x + cardPadding, detailY, {
           continued: true,
           lineBreak: false
         });

      doc.font(fonts.semibold)
         .fillColor(colors.gray900)
         .text(detail.value, {
           lineBreak: false
         });
    });

    // ========== COMPANY BRANDING FOOTER ==========
    const footerY = y + cardHeight - 35;

    doc.font(fonts.bold)
       .fontSize(fontSize.small)
       .fillColor(colors.primary)
       .text(branding.companyName, x, footerY, {
         width: width,
         align: 'center'
       });

    doc.font(fonts.primary)
       .fontSize(fontSize.tiny)
       .fillColor(colors.gray600)
       .text(branding.tagline, x, footerY + 15, {
         width: width,
         align: 'center'
       });

    // Card border
    doc.roundedRect(x, y, width, cardHeight, 10)
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
       .fill(curatorConfig.placeholderColor);

    // Initials text
    doc.font(fonts.bold)
       .fontSize(size / 2.5)
       .fillColor(colors.white)
       .text(initials, x, y + (size / 3), {
         width: size,
         align: 'center'
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
   * Render full-page "Get in Touch" final contact page
   * @private
   */
  static renderGetInTouchPage(doc, booking, images, x, y, width) {
    let currentY = y + spacing.md;

    // ========== PAGE HEADER ==========
    // Decorative top bar
    doc.rect(x, currentY, width, 4)
       .fill(colors.primary);

    currentY += 30;

    // Main heading
    doc.font(fonts.bold)
       .fontSize(fontSize.display || fontSize.h1)
       .fillColor(colors.gray900)
       .text('Get in Touch', x, currentY, {
         width: width,
         align: 'center'
       });

    currentY += 50;

    // Subtitle
    doc.font(fonts.primary)
       .fontSize(fontSize.h5)
       .fillColor(colors.gray600)
       .text('We\'re here to make your journey unforgettable', x, currentY, {
         width: width,
         align: 'center'
       });

    currentY += spacing.xl;

    // ========== CURATOR/EXPERT SECTION ==========
    currentY = this.renderExpertSection(doc, booking, images, x, currentY, width);

    currentY += spacing.lg;

    // ========== CONTACT METHODS GRID ==========
    currentY = this.renderContactMethodsGrid(doc, x, currentY, width);

    currentY += spacing.lg;

    // ========== COMPANY FOOTER BRANDING ==========
    this.renderCompanyFooterBranding(doc, x, width);
  }

  /**
   * Render travel expert section with photo and details
   * @private
   */
  static renderExpertSection(doc, booking, images, x, y, width) {
    const cardPadding = 25;
    const cardHeight = 180;

    // Get curator info
    const curator = booking.curator || {
      name: branding.companyName + ' Team',
      title: curatorConfig.defaultTitle,
      message: curatorConfig.defaultMessage,
      phone: branding.phone,
      email: branding.email,
      availability: curatorConfig.defaultAvailability
    };

    // ========== EXPERT CARD BACKGROUND ==========
    doc.roundedRect(x, y, width, cardHeight, 12)
       .fill(colors.primaryBg);

    // ========== LEFT SECTION - PROFILE PHOTO ==========
    const photoSize = 100;
    const photoX = x + (width / 2) - (photoSize / 2);
    const photoY = y + cardPadding;

    const hasPhoto = images && images.curatorPhoto;

    if (hasPhoto) {
      try {
        // Circular photo clip
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
           .lineWidth(3)
           .stroke();
      } catch (error) {
        console.warn('Failed to render curator photo:', error.message);
        this.renderCuratorInitials(doc, curator.name, photoX, photoY, photoSize);
      }
    } else {
      this.renderCuratorInitials(doc, curator.name, photoX, photoY, photoSize);
    }

    // ========== EXPERT DETAILS (CENTERED BELOW PHOTO) ==========
    let detailsY = photoY + photoSize + 20;

    // Curator name
    doc.font(fonts.bold)
       .fontSize(fontSize.h3)
       .fillColor(colors.gray900)
       .text(curator.name, x, detailsY, {
         width: width,
         align: 'center'
       });

    detailsY += 26;

    // Curator title
    doc.font(fonts.semibold)
       .fontSize(fontSize.body)
       .fillColor(colors.primary)
       .text(curator.title, x, detailsY, {
         width: width,
         align: 'center'
       });

    // Card border
    doc.roundedRect(x, y, width, cardHeight, 12)
       .strokeColor(colors.primary)
       .lineWidth(1.5)
       .stroke();

    return y + cardHeight;
  }

  /**
   * Render contact methods in grid layout
   * @private
   */
  static renderContactMethodsGrid(doc, x, y, width) {
    const cardPadding = 20;
    const cardHeight = 100;
    const cardGap = spacing.md;
    const cardWidth = (width - cardGap) / 2;

    const contactMethods = [
      {
        icon: '📞',
        label: 'Call Us',
        value: branding.phone,
        sublabel: 'Available 24/7',
        color: colors.success
      },
      {
        icon: '✉️',
        label: 'Email Us',
        value: branding.email,
        sublabel: 'Response within 2 hours',
        color: colors.info || colors.primary
      },
      {
        icon: '💬',
        label: 'WhatsApp',
        value: branding.whatsapp || branding.phone,
        sublabel: 'Instant messaging',
        color: colors.success
      },
      {
        icon: '🌐',
        label: 'Visit Website',
        value: branding.website || 'www.tripandevent.com',
        sublabel: 'Explore more packages',
        color: colors.primary
      }
    ];

    contactMethods.forEach((method, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const cardX = x + (col * (cardWidth + cardGap));
      const cardY = y + (row * (cardHeight + cardGap));

      // Card background
      doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 10)
         .fill(colors.gray50);

      // Icon circle
      const iconY = cardY + cardPadding;
      doc.circle(cardX + cardPadding + 20, iconY + 20, 20)
         .fill(method.color);

      doc.font(fonts.bold)
         .fontSize(fontSize.h4)
         .fillColor(colors.white)
         .text(method.icon, cardX + cardPadding + 12, iconY + 10, {
           lineBreak: false
         });

      // Contact details
      const textX = cardX + cardPadding + 55;

      // Label
      doc.font(fonts.semibold)
         .fontSize(fontSize.body)
         .fillColor(colors.gray900)
         .text(method.label, textX, iconY);

      // Value
      doc.font(fonts.bold)
         .fontSize(fontSize.small)
         .fillColor(colors.primary)
         .text(method.value, textX, iconY + 20, {
           width: cardWidth - 80,
           ellipsis: true
         });

      // Sublabel
      doc.font(fonts.primary)
         .fontSize(fontSize.tiny)
         .fillColor(colors.gray600)
         .text(method.sublabel, textX, iconY + 38);

      // Card border
      doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 10)
         .strokeColor(colors.gray300)
         .lineWidth(1)
         .stroke();
    });

    return y + (2 * (cardHeight + cardGap));
  }

  /**
   * Render company footer branding at bottom of page
   * @private
   */
  static renderCompanyFooterBranding(doc, x, width) {
    const footerY = doc.page.height - 120;

    // Decorative line
    doc.moveTo(x + width / 4, footerY)
       .lineTo(x + (3 * width / 4), footerY)
       .strokeColor(colors.gray300)
       .lineWidth(1)
       .stroke();

    // Company name
    doc.font(fonts.bold)
       .fontSize(fontSize.h3)
       .fillColor(colors.primary)
       .text(branding.companyName, x, footerY + 20, {
         width: width,
         align: 'center'
       });

    // Tagline
    doc.font(fonts.primary)
       .fontSize(fontSize.body)
       .fillColor(colors.gray600)
       .text(branding.tagline, x, footerY + 50, {
         width: width,
         align: 'center'
       });

    // Small decorative accent
    const accentSize = 40;
    const accentX = (doc.page.width - accentSize) / 2;
    doc.moveTo(accentX, footerY + 75)
       .lineTo(accentX + accentSize, footerY + 75)
       .strokeColor(colors.primary)
       .lineWidth(2)
       .stroke();
  }
}

module.exports = PoliciesSection;
