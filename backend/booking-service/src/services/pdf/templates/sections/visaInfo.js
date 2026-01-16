/**
 * Visa Information Section - Visa Requirements and Process
 * Displays visa requirements, documents needed, and application process
 * Only rendered if pkg.visaRequired === true
 */

const { colors, fonts, fontSize, spacing, branding } = require('../../../../config/pdf.config');

class VisaInfo {
  /**
   * Render "Visa Information" section
   * @param {Object} doc - PDFKit document
   * @param {Object} data - Section data
   * @param {Object} data.package - Package details with visa info
   */
  static async render(doc, { package: pkg }) {
    // Only render if visa is required
    if (!pkg || !pkg.visaRequired) {
      console.log('Visa section skipped - not required for this package');
      return doc.y;
    }

    const margin = doc.page.margins.left;
    const contentWidth = doc.page.width - (margin * 2);
    let currentY = doc.y;

    // Check if we need a new page
    if (currentY > doc.page.height - doc.page.margins.bottom - 350) {
      doc.addPage();
      currentY = doc.page.margins.top;
    }

    // Add section spacing
    currentY += spacing.xxl;

    // ========== SECTION HEADER ==========
    currentY = this.renderSectionHeader(doc, margin, currentY, contentWidth);

    // ========== VISA OVERVIEW CARD ==========
    if (pkg.visaInfo) {
      currentY = this.renderVisaOverviewCard(doc, pkg.visaInfo, margin, currentY, contentWidth);
      currentY += spacing.lg;
    }

    // ========== REQUIRED DOCUMENTS ==========
    if (pkg.visaInfo && pkg.visaInfo.requirements && pkg.visaInfo.requirements.length > 0) {
      currentY = this.renderRequiredDocuments(doc, pkg.visaInfo.requirements, margin, currentY, contentWidth);
      currentY += spacing.lg;
    }

    // ========== APPLICATION PROCESS ==========
    if (pkg.visaInfo && pkg.visaInfo.process) {
      currentY = this.renderApplicationProcess(doc, pkg.visaInfo.process, margin, currentY, contentWidth);
      currentY += spacing.lg;
    }

    // ========== IMPORTANT NOTES ==========
    currentY = this.renderImportantNotes(doc, pkg.visaInfo, margin, currentY, contentWidth);

    // Sync doc.y with calculated position for next section
    doc.y = currentY;

    return currentY;
  }

  /**
   * Render section header with decorative element
   * @private
   */
  static renderSectionHeader(doc, x, y, width) {
    // Decorative left bar
    doc.rect(x, y, 4, 50)
       .fill(colors.info || colors.primary);

    // Section title
    doc.font(fonts.bold)
       .fontSize(fontSize.h2)
       .fillColor(colors.gray900)
       .text('Visa Information', x + 15, y + 8, {
         lineBreak: false
       });

    // Decorative underline
    doc.moveTo(x + 15, y + 42)
       .lineTo(x + 250, y + 42)
       .strokeColor(colors.info || colors.primary)
       .lineWidth(2)
       .stroke();

    // Subtitle
    doc.font(fonts.primary)
       .fontSize(fontSize.body)
       .fillColor(colors.gray600)
       .text('Important visa requirements for your destination', x + 15, y + 55, {
         lineBreak: false
       });

    return y + 80;
  }

  /**
   * Render visa overview card with key details
   * @private
   */
  static renderVisaOverviewCard(doc, visaInfo, x, y, width) {
    const cardPadding = 20;
    const cardHeight = 120;

    // Card background
    doc.roundedRect(x, y, width, cardHeight, 10)
       .fill(colors.primaryBg);

    // ========== VISA TYPE ==========
    const colWidth = width / 3;

    // Column 1 - Visa Type
    let col1X = x + cardPadding;
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.gray600)
       .text('Visa Type', col1X, y + cardPadding);

    doc.font(fonts.bold)
       .fontSize(fontSize.h5)
       .fillColor(colors.gray900)
       .text(visaInfo.type || 'Tourist Visa', col1X, y + cardPadding + 20, {
         width: colWidth - 20
       });

    // Column 2 - Duration
    let col2X = x + colWidth;
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.gray600)
       .text('Validity', col2X, y + cardPadding);

    doc.font(fonts.bold)
       .fontSize(fontSize.h5)
       .fillColor(colors.gray900)
       .text(visaInfo.duration || '30 Days', col2X, y + cardPadding + 20, {
         width: colWidth - 20
       });

    // Column 3 - Processing Time
    let col3X = x + colWidth * 2;
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.gray600)
       .text('Processing Time', col3X, y + cardPadding);

    doc.font(fonts.bold)
       .fontSize(fontSize.h5)
       .fillColor(colors.gray900)
       .text(visaInfo.processingTime || '5-7 Days', col3X, y + cardPadding + 20, {
         width: colWidth - 20
       });

    // ========== APPLICATION METHOD ==========
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.gray600)
       .text('Application Method', col1X, y + cardPadding + 60);

    doc.font(fonts.semibold)
       .fontSize(fontSize.body)
       .fillColor(colors.primary)
       .text(visaInfo.process || 'Online/On Arrival', col1X, y + cardPadding + 78, {
         width: width - (cardPadding * 2)
       });

    // Card border
    doc.roundedRect(x, y, width, cardHeight, 10)
       .strokeColor(colors.primary)
       .lineWidth(1)
       .stroke();

    return y + cardHeight;
  }

  /**
   * Render required documents section
   * @private
   */
  static renderRequiredDocuments(doc, requirements, x, y, width) {
    let currentY = y;

    // Section heading
    doc.font(fonts.semibold)
       .fontSize(fontSize.h4)
       .fillColor(colors.gray800)
       .text('Required Documents', x, currentY);

    currentY += 30;

    // Documents grid (2 columns)
    const colWidth = (width - spacing.md) / 2;
    const leftColX = x;
    const rightColX = x + colWidth + spacing.md;

    let rowY = currentY;  // Track row Y separately

    requirements.forEach((requirement, index) => {
      const columnX = index % 2 === 0 ? leftColX : rightColX;
      const isNewRow = index % 2 === 0 && index > 0;

      if (isNewRow) {
        rowY += 45;  // Move to next row
        currentY = rowY;
      }

      // Check if we need a new page
      if (rowY > doc.page.height - doc.page.margins.bottom - 100) {
        doc.addPage();
        rowY = doc.page.margins.top;
        currentY = rowY;
      }

      // Document item box - BOTH columns use same row Y
      const itemY = rowY;

      doc.roundedRect(columnX, itemY, colWidth, 35, 6)
         .fill(colors.gray50);

      // Checkmark icon
      doc.fillColor(colors.success)
         .circle(columnX + 12, itemY + 18, 5)
         .fill();

      doc.font(fonts.bold)
         .fontSize(fontSize.tiny)
         .fillColor(colors.white)
         .text('✓', columnX + 9, itemY + 13, {
           lineBreak: false
         });

      // Document name
      doc.font(fonts.primary)
         .fontSize(fontSize.body)
         .fillColor(colors.gray800)
         .text(requirement, columnX + 28, itemY + 10, {
           width: colWidth - 35,
           ellipsis: true
         });

      // Border
      doc.roundedRect(columnX, itemY, colWidth, 35, 6)
         .strokeColor(colors.gray300)
         .lineWidth(0.5)
         .stroke();
    });

    // Update currentY to account for the last row
    currentY = rowY + 45;
    return currentY;
  }

  /**
   * Render application process
   * @private
   */
  static renderApplicationProcess(doc, process, x, y, width) {
    let currentY = y;

    // Section heading
    doc.font(fonts.semibold)
       .fontSize(fontSize.h4)
       .fillColor(colors.gray800)
       .text('Application Process', x, currentY);

    currentY += 30;

    // Process description
    doc.font(fonts.primary)
       .fontSize(fontSize.body)
       .fillColor(colors.gray700)
       .text(process, x, currentY, {
         width: width,
         lineGap: 3
       });

    currentY = doc.y + spacing.md;
    return currentY;
  }

  /**
   * Render important notes section
   * @private
   */
  static renderImportantNotes(doc, visaInfo, x, y, width) {
    const boxPadding = 20;
    const warningColor = colors.warning || colors.amber;

    // Default notes
    const defaultNotes = [
      'Visa requirements may vary based on your nationality. Please check with your nearest consulate.',
      'Processing times are indicative and may vary during peak seasons.',
      'Trip & Event can assist with visa processing. Contact our team for support.'
    ];

    const notes = visaInfo && visaInfo.notes ? visaInfo.notes : defaultNotes;

    // Calculate box height
    doc.font(fonts.primary).fontSize(fontSize.small);
    let textHeight = 0;
    notes.forEach(note => {
      textHeight += doc.heightOfString(`• ${note}`, {
        width: width - (boxPadding * 2),
        lineGap: 3
      }) + 10;
    });

    const boxHeight = Math.max(90, textHeight + 50);

    // Background
    doc.roundedRect(x, y, width, boxHeight, 8)
       .fill(warningColor);
    doc.roundedRect(x, y, width, boxHeight, 8)
       .fillOpacity(0.1)
       .fill(colors.white)
       .fillOpacity(1);

    // Heading
    doc.font(fonts.bold)
       .fontSize(fontSize.h5)
       .fillColor(colors.gray900)
       .text('📌 Important Notes', x + boxPadding, y + boxPadding);

    let notesY = y + boxPadding + 28;

    // Notes list
    notes.forEach(note => {
      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray800)
         .text(`• ${note}`, x + boxPadding, notesY, {
           width: width - (boxPadding * 2),
           lineGap: 3
         });

      notesY = doc.y + 10;
    });

    // Border
    doc.roundedRect(x, y, width, boxHeight, 8)
       .strokeColor(warningColor)
       .lineWidth(1.5)
       .stroke();

    return y + boxHeight;
  }
}

module.exports = VisaInfo;
