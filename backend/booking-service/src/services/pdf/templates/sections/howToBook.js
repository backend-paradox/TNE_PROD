/**
 * How to Book Section - Payment Instructions and Assistance
 * Provides clear booking instructions, payment link, QR code, and contact info
 */

const { colors, fonts, fontSize, spacing, branding } = require('../../../../config/pdf.config');

class HowToBook {
  /**
   * Render "How to Book" section with payment instructions
   * @param {Object} doc - PDFKit document
   * @param {Object} data - Section data
   * @param {Object} data.booking - Booking details with payment info
   */
  static async render(doc, { booking }) {
    const margin = doc.page.margins.left;
    const contentWidth = doc.page.width - (margin * 2);
    let currentY = doc.y;

    // Check if we need a new page
    if (currentY > doc.page.height - doc.page.margins.bottom - 400) {
      doc.addPage();
      currentY = doc.page.margins.top;
    }

    // Add section spacing
    currentY += spacing.xxl;

    // ========== SECTION HEADER ==========
    currentY = this.renderSectionHeader(doc, margin, currentY, contentWidth);

    // ========== PAYMENT INSTRUCTIONS CARD ==========
    if (booking.paymentLink || booking.paymentQRCode) {
      currentY = this.renderPaymentInstructionsCard(doc, booking, margin, currentY, contentWidth);
      currentY += spacing.lg;
    }

    // ========== BOOKING ASSISTANCE CARD ==========
    currentY = this.renderBookingAssistanceCard(doc, margin, currentY, contentWidth);
    currentY += spacing.lg;

    // ========== PAYMENT STEPS ==========
    currentY = this.renderPaymentSteps(doc, margin, currentY, contentWidth);

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
       .fill(colors.primary);

    // Section title
    doc.font(fonts.bold)
       .fontSize(fontSize.h2)
       .fillColor(colors.gray900)
       .text('How to Book', x + 15, y + 8, {
         lineBreak: false
       });

    // Decorative underline
    doc.moveTo(x + 15, y + 42)
       .lineTo(x + 200, y + 42)
       .strokeColor(colors.primary)
       .lineWidth(2)
       .stroke();

    // Subtitle
    doc.font(fonts.primary)
       .fontSize(fontSize.body)
       .fillColor(colors.gray600)
       .text('Complete your booking in a few simple steps', x + 15, y + 55, {
         lineBreak: false
       });

    return y + 80;
  }

  /**
   * Render payment instructions card with QR code
   * @private
   */
  static renderPaymentInstructionsCard(doc, booking, x, y, width) {
    const cardPadding = 20;
    const cardHeight = 160;

    // Card background with gradient effect
    doc.roundedRect(x, y, width, cardHeight, 10)
       .fill(colors.primaryBg);

    // Left section - QR code (if available)
    if (booking.paymentQRCode) {
      try {
        const qrSize = 120;
        const qrX = x + cardPadding;
        const qrY = y + cardHeight / 2 - qrSize / 2;

        // QR code border
        doc.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 4)
           .fill(colors.white);

        // QR code image (if it's a base64 data URL or file path)
        if (booking.paymentQRCode.startsWith('data:image')) {
          const base64Data = booking.paymentQRCode.split(',')[1];
          const imgBuffer = Buffer.from(base64Data, 'base64');
          doc.image(imgBuffer, qrX, qrY, {
            width: qrSize,
            height: qrSize,
            fit: [qrSize, qrSize]
          });
        }

        // QR code label
        doc.font(fonts.primary)
           .fontSize(fontSize.tiny)
           .fillColor(colors.gray500)
           .text('Scan to Pay', qrX, qrY + qrSize + 8, {
             width: qrSize,
             align: 'center'
           });
      } catch (error) {
        console.warn('Failed to render QR code:', error.message);
      }
    }

    // Right section - Payment instructions
    const textX = booking.paymentQRCode ? x + 180 : x + cardPadding;
    const textWidth = booking.paymentQRCode ? width - 200 : width - (cardPadding * 2);

    // Heading
    doc.font(fonts.bold)
       .fontSize(fontSize.h4)
       .fillColor(colors.primary)
       .text('Make Payment', textX, y + cardPadding);

    // Payment link
    if (booking.paymentLink) {
      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray700)
         .text('Payment Link:', textX, y + cardPadding + 28);

      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.primary)
         .text(
           booking.paymentLink.length > 50
             ? booking.paymentLink.substring(0, 50) + '...'
             : booking.paymentLink,
           textX,
           y + cardPadding + 46,
           {
             width: textWidth,
             underline: true,
             link: booking.paymentLink
           }
         );
    }

    // Instructions
    const instructionsY = booking.paymentLink ? y + cardPadding + 70 : y + cardPadding + 28;
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.gray600)
       .text(
         'Click the link above or scan the QR code to complete your payment securely through our payment gateway.',
         textX,
         instructionsY,
         {
           width: textWidth,
           lineGap: 2
         }
       );

    // Card border
    doc.roundedRect(x, y, width, cardHeight, 10)
       .strokeColor(colors.primary)
       .lineWidth(1)
       .stroke();

    return y + cardHeight;
  }

  /**
   * Render booking assistance contact card
   * @private
   */
  static renderBookingAssistanceCard(doc, x, y, width) {
    const cardPadding = 20;
    const cardHeight = 100;

    // Card background
    doc.roundedRect(x, y, width, cardHeight, 10)
       .fill(colors.gray50);

    // Icon section (left)
    const iconX = x + cardPadding;
    const iconY = y + cardHeight / 2;

    // Phone icon circle
    doc.circle(iconX + 20, iconY, 20)
       .fill(colors.primary);

    doc.font(fonts.bold)
       .fontSize(fontSize.h4)
       .fillColor(colors.white)
       .text('📞', iconX + 12, iconY - 10, {
         lineBreak: false
       });

    // Contact details (right)
    const detailsX = iconX + 60;
    let detailsY = y + cardPadding;

    // Heading
    doc.font(fonts.semibold)
       .fontSize(fontSize.h5)
       .fillColor(colors.gray900)
       .text('Need Help with Booking?', detailsX, detailsY);

    detailsY += 24;

    // Phone
    doc.font(fonts.primary)
       .fontSize(fontSize.body)
       .fillColor(colors.gray700)
       .text('Call us: ', detailsX, detailsY, { continued: true });

    doc.font(fonts.bold)
       .fillColor(colors.primary)
       .text(branding.phone);

    detailsY += 20;

    // Email
    doc.font(fonts.primary)
       .fontSize(fontSize.body)
       .fillColor(colors.gray700)
       .text('Email: ', detailsX, detailsY, { continued: true });

    doc.font(fonts.bold)
       .fillColor(colors.primary)
       .text(branding.email);

    // Card border
    doc.roundedRect(x, y, width, cardHeight, 10)
       .strokeColor(colors.gray300)
       .lineWidth(1)
       .stroke();

    return y + cardHeight;
  }

  /**
   * Render payment steps
   * @private
   */
  static renderPaymentSteps(doc, x, y, width) {
    let currentY = y;

    // Section heading
    doc.font(fonts.semibold)
       .fontSize(fontSize.h4)
       .fillColor(colors.gray800)
       .text('Payment Steps:', x, currentY);

    currentY += 30;

    const steps = [
      {
        number: '1',
        title: 'Review Your Booking',
        description: 'Verify all booking details including dates, travelers, and package information.'
      },
      {
        number: '2',
        title: 'Make Payment',
        description: 'Click the payment link or scan QR code to proceed with secure payment.'
      },
      {
        number: '3',
        title: 'Confirmation',
        description: 'Receive booking confirmation via email and SMS once payment is successful.'
      },
      {
        number: '4',
        title: 'Stay Connected',
        description: 'Our travel expert will contact you within 24 hours to finalize details.'
      }
    ];

    steps.forEach((step, index) => {
      currentY = this.renderPaymentStep(doc, step, x, currentY, width);
      if (index < steps.length - 1) {
        currentY += spacing.sm;
      }
    });

    return currentY;
  }

  /**
   * Render individual payment step
   * @private
   */
  static renderPaymentStep(doc, step, x, y, width) {
    const stepHeight = 65;
    const numberSize = 30;

    // Step number circle
    doc.circle(x + numberSize / 2, y + stepHeight / 2, numberSize / 2)
       .fill(colors.primary);

    doc.font(fonts.bold)
       .fontSize(fontSize.h4)
       .fillColor(colors.white)
       .text(step.number, x + numberSize / 2 - 7, y + stepHeight / 2 - 8, {
         lineBreak: false
       });

    // Step content
    const contentX = x + numberSize + 20;
    const contentWidth = width - numberSize - 20;

    // Step title
    doc.font(fonts.semibold)
       .fontSize(fontSize.h5)
       .fillColor(colors.gray900)
       .text(step.title, contentX, y + 8);

    // Step description
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.gray600)
       .text(step.description, contentX, y + 28, {
         width: contentWidth,
         lineGap: 2
       });

    // Connecting line (if not last step)
    if (step.number !== '4') {
      doc.moveTo(x + numberSize / 2, y + stepHeight)
         .lineTo(x + numberSize / 2, y + stepHeight + spacing.sm)
         .strokeColor(colors.gray300)
         .lineWidth(2)
         .dash(5, { space: 3 })
         .stroke()
         .undash();
    }

    return y + stepHeight;
  }
}

module.exports = HowToBook;
