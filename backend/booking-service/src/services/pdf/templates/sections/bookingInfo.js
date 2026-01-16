/**
 * Booking Information Section
 * Renders booking summary and traveler details
 */

const { colors, fonts, fontSize, spacing, table, icons } = require('../../../../config/pdf.config');

class BookingInfo {
  /**
   * Render booking information section
   * @param {PDFDocument} doc - PDFKit document instance
   * @param {Object} data - Rendering data
   * @param {Object} data.booking - Booking details
   * @param {Object} data.user - User details (optional)
   */
  static async render(doc, { booking, user }) {
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;
    const contentWidth = pageWidth - (margin * 2);

    // ========== SECTION HEADING ==========
    this.renderSectionHeader(doc, 'Booking Summary', margin);

    let currentY = doc.y + spacing.md;

    // ========== BOOKING DETAILS TABLE ==========
    const bookingDetails = this.prepareBookingDetails(booking, user);

    currentY = this.renderDetailsTable(doc, bookingDetails, margin, currentY, contentWidth);

    currentY += spacing.xl;

    // ========== TRAVELERS SECTION ==========
    if (booking.travelers && booking.travelers.length > 0) {
      // Check if we need a new page
      if (currentY > doc.page.height - doc.page.margins.bottom - 250) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      this.renderSectionHeader(doc, 'Traveler Information', margin, currentY);
      currentY = doc.y + spacing.md;

      currentY = this.renderTravelersTable(doc, booking.travelers, margin, currentY, contentWidth);
    }

    // ========== CONTACT INFORMATION (if available) ==========
    if (booking.contactInfo || user) {
      currentY += spacing.xl;

      // Check if we need a new page
      if (currentY > doc.page.height - doc.page.margins.bottom - 200) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      this.renderSectionHeader(doc, 'Contact Information', margin, currentY);
      currentY = doc.y + spacing.md;

      const contactDetails = this.prepareContactDetails(booking, user);
      currentY = this.renderDetailsTable(doc, contactDetails, margin, currentY, contentWidth);
    }

    // Sync doc.y with calculated position for next section
    doc.y = currentY;

    // Don't add page - let next section decide if it needs a new page
  }

  /**
   * Render section header with decorative elements
   * @private
   */
  static renderSectionHeader(doc, title, x, y = null) {
    const startY = y !== null ? y : doc.y;

    // Decorative line before title
    doc.moveTo(x, startY + 10)
       .lineTo(x + 40, startY + 10)
       .strokeColor(colors.primary)
       .lineWidth(3)
       .stroke();

    // Title text
    doc.font(fonts.bold)
       .fontSize(fontSize.h3)
       .fillColor(colors.gray900)
       .text(title, x + 50, startY);

    // Return position after header instead of manipulating doc.y
    doc.y = startY + 35;
    return doc.y;
  }

  /**
   * Prepare booking details for display
   * @private
   */
  static prepareBookingDetails(booking, user) {
    const details = [
      { label: 'Booking Number', value: booking.bookingNumber || 'N/A' },
      { label: 'Booking Status', value: this.formatStatus(booking.status) },
      {
        label: 'Booking Date',
        value: booking.createdAt
          ? new Date(booking.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'N/A'
      },
      { label: 'Booking Type', value: booking.type || 'PACKAGE' },
    ];

    // Add package name if available
    if (booking.packageName) {
      details.push({ label: 'Package Name', value: booking.packageName });
    }

    // Add number of travelers
    const travelerCount = booking.travelers?.length || booking.numTravelers || 0;
    details.push({
      label: 'Number of Travelers',
      value: `${travelerCount} Person${travelerCount !== 1 ? 's' : ''}`
    });

    // Add user name if available
    if (user && user.name) {
      details.push({ label: 'Booked By', value: user.name });
    }

    return details;
  }

  /**
   * Prepare contact details for display
   * @private
   */
  static prepareContactDetails(booking, user) {
    const details = [];

    const contactInfo = booking.contactInfo || {};

    if (contactInfo.name || user?.name) {
      details.push({ label: 'Contact Person', value: contactInfo.name || user.name });
    }

    if (contactInfo.email || user?.email) {
      details.push({ label: 'Email', value: contactInfo.email || user.email });
    }

    if (contactInfo.phone || user?.phone) {
      details.push({ label: 'Phone', value: contactInfo.phone || user.phone });
    }

    if (contactInfo.address) {
      details.push({ label: 'Address', value: contactInfo.address });
    }

    return details;
  }

  /**
   * Render details as a styled table
   * @private
   */
  static renderDetailsTable(doc, details, x, y, width) {
    const rowHeight = 35;
    const labelWidth = width * 0.4;
    const valueWidth = width * 0.6;
    const cellPadding = table.cellPadding;

    let currentY = y;

    details.forEach((detail, index) => {
      // Check if we need a new page
      if (currentY > doc.page.height - doc.page.margins.bottom - 100) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      // Background for alternate rows
      if (index % 2 === 0) {
        doc.rect(x, currentY, width, rowHeight)
           .fill(table.altRowBg);
      }

      // Label column
      doc.font(fonts.semibold)
         .fontSize(fontSize.body)
         .fillColor(colors.gray700)
         .text(detail.label, x + cellPadding, currentY + cellPadding, {
           width: labelWidth - (cellPadding * 2),
           align: 'left'
         });

      // Value column
      doc.font(fonts.primary)
         .fontSize(fontSize.body)
         .fillColor(colors.gray900)
         .text(detail.value, x + labelWidth + cellPadding, currentY + cellPadding, {
           width: valueWidth - (cellPadding * 2),
           align: 'left'
         });

      // Border lines
      doc.rect(x, currentY, width, rowHeight)
         .strokeColor(table.borderColor)
         .lineWidth(table.borderWidth)
         .stroke();

      currentY += rowHeight;
    });

    return currentY;
  }

  /**
   * Render travelers table
   * @private
   */
  static renderTravelersTable(doc, travelers, x, y, width) {
    const headerHeight = 35;
    const rowHeight = 40;
    const cellPadding = table.cellPadding;

    // Column widths
    const col1Width = width * 0.08; // S.No
    const col2Width = width * 0.35; // Name
    const col3Width = width * 0.20; // Age
    const col4Width = width * 0.37; // ID Type & Number

    let currentY = y;

    // ========== TABLE HEADER ==========
    // Header background
    doc.rect(x, currentY, width, headerHeight)
       .fill(table.headerBg);

    // Header text
    doc.font(fonts.bold)
       .fontSize(fontSize.body)
       .fillColor(table.headerColor);

    const headers = [
      { text: 'S.No', x: x + cellPadding, width: col1Width - cellPadding },
      { text: 'Traveler Name', x: x + col1Width + cellPadding, width: col2Width - cellPadding },
      { text: 'Age / Gender', x: x + col1Width + col2Width + cellPadding, width: col3Width - cellPadding },
      { text: 'ID Proof', x: x + col1Width + col2Width + col3Width + cellPadding, width: col4Width - cellPadding }
    ];

    headers.forEach(header => {
      doc.text(header.text, header.x, currentY + cellPadding + 2, {
        width: header.width,
        align: 'left'
      });
    });

    currentY += headerHeight;

    // ========== TABLE ROWS ==========
    travelers.forEach((traveler, index) => {
      // Check if we need a new page
      if (currentY > doc.page.height - doc.page.margins.bottom - 100) {
        doc.addPage();
        currentY = doc.page.margins.top;

        // Redraw header on new page
        doc.rect(x, currentY, width, headerHeight).fill(table.headerBg);
        doc.font(fonts.bold).fontSize(fontSize.body).fillColor(table.headerColor);
        headers.forEach(header => {
          doc.text(header.text, header.x, currentY + cellPadding + 2, {
            width: header.width,
            align: 'left'
          });
        });
        currentY += headerHeight;
      }

      // Alternate row background
      if (index % 2 === 1) {
        doc.rect(x, currentY, width, rowHeight).fill(table.altRowBg);
      } else {
        doc.rect(x, currentY, width, rowHeight).fill(table.rowBg);
      }

      // Row data
      doc.font(fonts.primary)
         .fontSize(fontSize.body)
         .fillColor(colors.gray900);

      // S.No
      doc.text((index + 1).toString(), x + cellPadding, currentY + cellPadding + 5, {
        width: col1Width - (cellPadding * 2),
        align: 'left'
      });

      // Name (with title if available)
      const fullName = traveler.title
        ? `${traveler.title} ${traveler.firstName} ${traveler.lastName || ''}`.trim()
        : `${traveler.firstName} ${traveler.lastName || ''}`.trim();

      doc.text(fullName, x + col1Width + cellPadding, currentY + cellPadding + 5, {
        width: col2Width - (cellPadding * 2),
        align: 'left'
      });

      // Age / Gender
      const ageGender = [];
      if (traveler.age) ageGender.push(`${traveler.age} yrs`);
      if (traveler.gender) ageGender.push(traveler.gender);

      doc.text(ageGender.join(' / ') || 'N/A', x + col1Width + col2Width + cellPadding, currentY + cellPadding + 5, {
        width: col3Width - (cellPadding * 2),
        align: 'left'
      });

      // ID Proof
      const idProof = traveler.idType && traveler.idNumber
        ? `${traveler.idType}: ${traveler.idNumber}`
        : 'Not provided';

      doc.fontSize(fontSize.small)
         .text(idProof, x + col1Width + col2Width + col3Width + cellPadding, currentY + cellPadding + 5, {
           width: col4Width - (cellPadding * 2),
           align: 'left'
         });

      // Row border
      doc.rect(x, currentY, width, rowHeight)
         .strokeColor(table.borderColor)
         .lineWidth(table.borderWidth)
         .stroke();

      currentY += rowHeight;
    });

    return currentY;
  }

  /**
   * Format booking status with color coding
   * @private
   */
  static formatStatus(status) {
    const statusMap = {
      'PENDING': 'Pending Confirmation',
      'CONFIRMED': 'Confirmed',
      'CANCELLED': 'Cancelled',
      'COMPLETED': 'Completed',
      'PAYMENT_PENDING': 'Payment Pending'
    };

    return statusMap[status] || status;
  }
}

module.exports = BookingInfo;
