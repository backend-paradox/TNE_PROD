/**
 * Pricing Section
 * Renders detailed cost breakdown and payment information
 */

const { colors, fonts, fontSize, spacing, table, paymentSchedule: paymentScheduleConfig } = require('../../../../config/pdf.config');

class PricingSection {
  /**
   * Render the pricing section
   * @param {PDFDocument} doc - PDFKit document instance
   * @param {Object} data - Rendering data
   * @param {Object} data.booking - Booking details with pricing
   */
  static async render(doc, { booking }) {
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;
    const contentWidth = pageWidth - (margin * 2);

    // ========== SECTION HEADING ==========
    this.renderSectionHeader(doc, 'Pricing Breakdown', margin);

    let currentY = doc.y + spacing.md;

    // ========== PRICING TABLE ==========
    const pricingItems = this.preparePricingData(booking);

    currentY = this.renderPricingTable(doc, pricingItems, margin, currentY, contentWidth);

    currentY += spacing.lg;

    // ========== TOTAL EXCLUDING TCS (if applicable) ==========
    // Calculate TCS amount and total excluding TCS
    const tcsAmount = booking.tcsAmount || 0;
    const totalExcludingTCS = (booking.totalAmount || 0) - tcsAmount;

    if (tcsAmount > 0) {
      // Check if we need a new page
      if (currentY > doc.page.height - doc.page.margins.bottom - 200) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      currentY = this.renderTotalExcludingTCS(doc, totalExcludingTCS, margin, currentY, contentWidth);
      currentY += spacing.md;

      currentY = this.renderTCSInfoBox(doc, booking, margin, currentY, contentWidth);
      currentY += spacing.xl;
    }

    // ========== PAYMENT SCHEDULE ==========
    // Check if we need a new page
    if (currentY > doc.page.height - doc.page.margins.bottom - 350) {
      doc.addPage();
      currentY = doc.page.margins.top;
    }

    this.renderSectionHeader(doc, 'Payment Options & Schedule', margin, currentY);
    currentY = doc.y + spacing.md;

    currentY = this.renderPaymentScheduleSection(doc, booking, margin, currentY, contentWidth);

    currentY += spacing.lg;

    // ========== PAYMENT INFORMATION ==========
    if (booking.payments && booking.payments.length > 0) {
      // Check if we need a new page
      if (currentY > doc.page.height - doc.page.margins.bottom - 200) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      this.renderSectionHeader(doc, 'Payment Information', margin, currentY);
      currentY = doc.y + spacing.md;

      currentY = this.renderPaymentInfo(doc, booking.payments, margin, currentY, contentWidth);
    }

    // ========== IMPORTANT NOTES ==========
    currentY += spacing.xl;

    // Check if we need a new page
    if (currentY > doc.page.height - doc.page.margins.bottom - 180) {
      doc.addPage();
      currentY = doc.page.margins.top;
    }

    this.renderPricingNotes(doc, margin, currentY, contentWidth);

    // Sync doc.y for next section (renderPricingNotes updates doc.y internally)
    // No need to update currentY since method ends here

    // Don't add page - let next section decide if it needs a new page
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
       .text(title, x + 50, startY);

    // Return position after header instead of manipulating doc.y
    doc.y = startY + 35;
    return doc.y;
  }

  /**
   * Render payment schedule section with payment options and milestone timeline
   * @private
   */
  static renderPaymentScheduleSection(doc, booking, x, y, width) {
    let currentY = y;

    // ========== PAYMENT OPTIONS CARDS ==========
    const cardWidth = (width - spacing.lg) / 2;
    const fullPaymentCardX = x;
    const installmentCardX = x + cardWidth + spacing.lg;
    const cardHeight = 110;

    // Calculate discount amount
    const fullPaymentDiscount = Math.round(
      (booking.totalAmount || 0) * (paymentScheduleConfig.fullPaymentDiscountPercent / 100)
    );

    // FULL PAYMENT CARD
    doc.roundedRect(fullPaymentCardX, currentY, cardWidth, cardHeight, 8)
       .fill(colors.primaryBg);

    doc.font(fonts.bold)
       .fontSize(fontSize.h4)
       .fillColor(colors.primary)
       .text('Full Payment', fullPaymentCardX + 15, currentY + 15, {
         width: cardWidth - 30
       });

    doc.font(fonts.bold)
       .fontSize(fontSize.h2)
       .fillColor(colors.gray900)
       .text(
         `₹${(booking.totalAmount || 0).toLocaleString('en-IN')}`,
         fullPaymentCardX + 15,
         currentY + 45,
         { width: cardWidth - 30 }
       );

    // Discount badge
    if (fullPaymentDiscount > 0) {
      const badgeY = currentY + cardHeight - 35;
      doc.roundedRect(fullPaymentCardX + 15, badgeY, 120, 22, 4)
         .fill(colors.success);

      doc.font(fonts.semibold)
         .fontSize(fontSize.small)
         .fillColor(colors.white)
         .text(
           `Save ₹${fullPaymentDiscount.toLocaleString('en-IN')} (${paymentScheduleConfig.fullPaymentDiscountPercent}%)`,
           fullPaymentCardX + 20,
           badgeY + 5,
           { width: 110, lineBreak: false }
         );
    }

    // Card border
    doc.roundedRect(fullPaymentCardX, currentY, cardWidth, cardHeight, 8)
       .strokeColor(colors.primary)
       .lineWidth(1.5)
       .stroke();

    // INSTALLMENT PLAN CARD
    doc.roundedRect(installmentCardX, currentY, cardWidth, cardHeight, 8)
       .fill(colors.gray50);

    doc.font(fonts.bold)
       .fontSize(fontSize.h4)
       .fillColor(colors.gray900)
       .text('Installment Plan', installmentCardX + 15, currentY + 15, {
         width: cardWidth - 30
       });

    const milestoneCount = booking.paymentSchedule?.length || paymentScheduleConfig.defaultMilestones;
    doc.font(fonts.semibold)
       .fontSize(fontSize.h3)
       .fillColor(colors.primary)
       .text(
         `${milestoneCount} Milestones`,
         installmentCardX + 15,
         currentY + 45,
         { width: cardWidth - 30 }
       );

    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.gray600)
       .text(
         'Pay in easy installments',
         installmentCardX + 15,
         currentY + 75,
         { width: cardWidth - 30 }
       );

    // Card border
    doc.roundedRect(installmentCardX, currentY, cardWidth, cardHeight, 8)
       .strokeColor(colors.gray300)
       .lineWidth(1)
       .stroke();

    currentY += cardHeight + spacing.xl;

    // ========== PAYMENT MILESTONES TIMELINE ==========
    // Generate or use existing payment schedule
    const paymentSchedule = booking.paymentSchedule || this.generateDefaultSchedule(booking);

    // Milestones heading
    doc.font(fonts.bold)
       .fontSize(fontSize.h4)
       .fillColor(colors.gray900)
       .text('Payment Milestones', x, currentY);

    currentY += 30;

    // Render each milestone (pass total count for proper timeline rendering)
    const totalMilestones = paymentSchedule.length;
    paymentSchedule.forEach((milestone, index) => {
      currentY = this.renderMilestoneRow(doc, milestone, index, x, currentY, width, totalMilestones);
    });

    currentY += spacing.lg;

    // ========== "PAY NOW" CALL-TO-ACTION BUTTON (if payment link exists) ==========
    if (booking.paymentLink) {
      currentY = this.renderPayNowButton(doc, booking.paymentLink, x, currentY, width);
    }

    return currentY;
  }

  /**
   * Render individual milestone row in payment timeline
   * @private
   */
  static renderMilestoneRow(doc, milestone, index, x, y, width, totalMilestones) {
    const rowHeight = 70;
    const iconX = x + 15;
    const iconY = y + 35;
    const lineHeight = rowHeight;

    // Vertical connecting line (except for last milestone)
    if (index > 0) {
      doc.moveTo(iconX, y)
         .lineTo(iconX, y + 15)
         .strokeColor(colors.gray300)
         .lineWidth(2)
         .stroke();
    }

    // Status icon (checkmark for paid, empty circle for pending)
    if (milestone.isPaid) {
      // Filled green circle with checkmark
      doc.circle(iconX, iconY, 12)
         .fill(colors.success);

      doc.font(fonts.bold)
         .fontSize(fontSize.small)
         .fillColor(colors.white)
         .text('✓', iconX - 5, iconY - 6, {
           lineBreak: false
         });
    } else {
      // Empty gray circle
      doc.circle(iconX, iconY, 12)
         .strokeColor(milestone.isOverdue ? colors.error : colors.gray400)
         .lineWidth(2)
         .stroke();

      doc.circle(iconX, iconY, 12)
         .fill(colors.white);
    }

    // Connecting line to next milestone (except for last one)
    // Use dynamic totalMilestones instead of hardcoded 4
    if (index < totalMilestones - 1) {
      doc.moveTo(iconX, iconY + 12)
         .lineTo(iconX, y + lineHeight)
         .strokeColor(colors.gray300)
         .lineWidth(2)
         .stroke();
    }

    // Milestone details
    const detailsX = x + 45;

    // Milestone name
    doc.font(fonts.semibold)
       .fontSize(fontSize.body)
       .fillColor(colors.gray900)
       .text(milestone.name || `Milestone ${index + 1}`, detailsX, y + 15);

    // Amount and due date
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.gray600)
       .text(
         `₹${(milestone.amount || 0).toLocaleString('en-IN')}  •  Due: ${this.formatDate(milestone.dueDate)}`,
         detailsX,
         y + 35
       );

    // Status badge (right-aligned)
    const badgeWidth = 80;
    const badgeHeight = 24;
    const badgeX = x + width - badgeWidth - 15;
    const badgeY = y + 20;

    let badgeColor, badgeText;
    if (milestone.isPaid) {
      badgeColor = colors.success;
      badgeText = 'PAID';
    } else if (milestone.isOverdue) {
      badgeColor = colors.error;
      badgeText = 'OVERDUE';
    } else {
      badgeColor = colors.warning;
      badgeText = 'PENDING';
    }

    doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 4)
       .fill(badgeColor);

    doc.font(fonts.bold)
       .fontSize(fontSize.tiny)
       .fillColor(colors.white)
       .text(badgeText, badgeX, badgeY + 7, {
         width: badgeWidth,
         align: 'center'
       });

    return y + rowHeight;
  }

  /**
   * Generate default payment schedule if not provided
   * @private
   */
  static generateDefaultSchedule(booking) {
    const totalAmount = booking.totalAmount || 0;
    const milestoneAmount = Math.round(totalAmount / paymentScheduleConfig.defaultMilestones);
    const today = new Date();

    const schedule = [];
    for (let i = 0; i < paymentScheduleConfig.defaultMilestones; i++) {
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + (i * paymentScheduleConfig.intervalDays));

      schedule.push({
        name: paymentScheduleConfig.milestoneNames[i] || `Milestone ${i + 1}`,
        amount: i === paymentScheduleConfig.defaultMilestones - 1
          ? totalAmount - (milestoneAmount * (paymentScheduleConfig.defaultMilestones - 1)) // Adjust last amount for rounding
          : milestoneAmount,
        dueDate: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        isPaid: i === 0 && booking.paidAmount > 0, // Mark first as paid if any payment made
        isOverdue: false
      });
    }

    return schedule;
  }

  /**
   * Format date for display
   * @private
   */
  static formatDate(dateString) {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Prepare pricing data from booking
   * @private
   */
  static preparePricingData(booking) {
    const items = [];

    // Base price
    if (booking.basePrice || booking.packagePrice) {
      const basePrice = booking.basePrice || booking.packagePrice;
      const travelers = booking.travelers?.length || booking.numTravelers || 1;

      items.push({
        description: `Package Cost (${travelers} traveler${travelers !== 1 ? 's' : ''})`,
        amount: basePrice,
        isSubtotal: false
      });
    }

    // Additional charges from pricing object
    if (booking.pricing) {
      const pricing = booking.pricing;

      if (pricing.addonCost && pricing.addonCost > 0) {
        items.push({
          description: 'Add-on Services',
          amount: pricing.addonCost,
          isSubtotal: false
        });
      }

      if (pricing.discount && pricing.discount > 0) {
        items.push({
          description: 'Discount Applied',
          amount: -pricing.discount,
          isSubtotal: false,
          isDiscount: true
        });
      }

      // Subtotal before taxes
      if (pricing.subtotal) {
        items.push({
          description: 'Subtotal',
          amount: pricing.subtotal,
          isSubtotal: true
        });
      }

      // Taxes
      if (pricing.taxAmount && pricing.taxAmount > 0) {
        items.push({
          description: `Taxes (${pricing.taxPercentage || 18}%)`,
          amount: pricing.taxAmount,
          isSubtotal: false
        });
      }

      if (pricing.serviceFee && pricing.serviceFee > 0) {
        items.push({
          description: 'Service Fee',
          amount: pricing.serviceFee,
          isSubtotal: false
        });
      }
    }

    // Grand Total
    items.push({
      description: 'Total Amount',
      amount: booking.totalAmount || booking.finalAmount || 0,
      isTotal: true
    });

    // Amount paid
    if (booking.paidAmount && booking.paidAmount > 0) {
      items.push({
        description: 'Amount Paid',
        amount: booking.paidAmount,
        isSubtotal: false,
        isPaid: true
      });

      // Balance due
      const balance = (booking.totalAmount || 0) - booking.paidAmount;
      if (balance > 0) {
        items.push({
          description: 'Balance Due',
          amount: balance,
          isBalance: true
        });
      }
    }

    return items;
  }

  /**
   * Render pricing table
   * @private
   */
  static renderPricingTable(doc, items, x, y, width) {
    const rowHeight = 35;
    const cellPadding = table.cellPadding;
    const descWidth = width * 0.65;
    const amountWidth = width * 0.35;

    let currentY = y;

    items.forEach((item, index) => {
      // Check if we need a new page
      if (currentY > doc.page.height - doc.page.margins.bottom - 100) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      let bgColor = colors.white;
      let textColor = colors.gray900;
      let fontType = fonts.primary;
      let textSize = fontSize.body;
      let rowHeightCustom = rowHeight;

      // Apply styling based on item type
      if (item.isTotal) {
        bgColor = colors.primary;
        textColor = colors.white;
        fontType = fonts.bold;
        textSize = fontSize.h4;
        rowHeightCustom = 45;
      } else if (item.isSubtotal) {
        bgColor = colors.gray100;
        fontType = fonts.semibold;
      } else if (item.isBalance) {
        bgColor = colors.warning;
        textColor = colors.white;
        fontType = fonts.bold;
      } else if (item.isPaid) {
        bgColor = colors.success;
        textColor = colors.white;
        fontType = fonts.semibold;
      } else if (item.isDiscount) {
        textColor = colors.success;
      } else if (index % 2 === 0) {
        bgColor = table.altRowBg;
      }

      // Background
      doc.rect(x, currentY, width, rowHeightCustom)
         .fill(bgColor);

      // Description
      doc.font(fontType)
         .fontSize(textSize)
         .fillColor(textColor)
         .text(item.description, x + cellPadding, currentY + (rowHeightCustom / 2) - 6, {
           width: descWidth - (cellPadding * 2),
           align: 'left'
         });

      // Amount
      const formattedAmount = this.formatAmount(item.amount);
      doc.text(formattedAmount, x + descWidth + cellPadding, currentY + (rowHeightCustom / 2) - 6, {
        width: amountWidth - (cellPadding * 2),
        align: 'right'
      });

      // Border
      doc.rect(x, currentY, width, rowHeightCustom)
         .strokeColor(item.isTotal ? colors.primary : table.borderColor)
         .lineWidth(item.isTotal ? 1.5 : table.borderWidth)
         .stroke();

      currentY += rowHeightCustom;
    });

    return currentY;
  }

  /**
   * Render payment information
   * @private
   */
  static renderPaymentInfo(doc, payments, x, y, width) {
    let currentY = y;

    // Payment summary box
    doc.roundedRect(x, currentY, width, 10, 8)
       .fill(colors.gray50);

    currentY += spacing.md;

    payments.forEach((payment, index) => {
      // Payment card
      const cardHeight = 100;

      if (currentY + cardHeight > doc.page.height - doc.page.margins.bottom - 100) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      // Payment number
      doc.font(fonts.bold)
         .fontSize(fontSize.h5)
         .fillColor(colors.gray700)
         .text(`Payment ${index + 1}`, x + spacing.md, currentY);

      currentY += 25;

      // Payment details
      const details = [
        { label: 'Amount', value: this.formatAmount(payment.amount) },
        { label: 'Method', value: payment.method || 'N/A' },
        { label: 'Status', value: payment.status || 'PENDING' },
        {
          label: 'Date',
          value: payment.paidAt
            ? new Date(payment.paidAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : 'N/A'
        }
      ];

      details.forEach(detail => {
        doc.font(fonts.primary)
           .fontSize(fontSize.small)
           .fillColor(colors.gray600)
           .text(detail.label + ': ', x + spacing.md, currentY, { continued: true });

        doc.font(fonts.semibold)
           .fillColor(colors.gray900)
           .text(detail.value);

        currentY += 18;
      });

      // Transaction ID if available
      if (payment.transactionId) {
        doc.font(fonts.primary)
           .fontSize(fontSize.tiny)
           .fillColor(colors.gray500)
           .text(`Transaction ID: ${payment.transactionId}`, x + spacing.md, currentY);

        currentY += 15;
      }

      currentY += spacing.md;

      // Border around payment
      doc.roundedRect(x, y, width, currentY - y, 8)
         .strokeColor(colors.gray300)
         .lineWidth(1)
         .stroke();

      currentY += spacing.lg;
      y = currentY;
    });

    return currentY;
  }

  /**
   * Render pricing notes and disclaimers
   * @private
   */
  static renderPricingNotes(doc, x, y, width) {
    // Notes heading
    doc.font(fonts.semibold)
       .fontSize(fontSize.h5)
       .fillColor(colors.gray700)
       .text('Important Notes', x, y);

    y += 25;

    const notes = [
      'All prices are in Indian Rupees (INR).',
      'Prices are subject to change based on availability and booking date.',
      'Additional charges may apply for last-minute bookings or peak season travel.',
      'Service tax and other applicable taxes are included in the total amount.',
      'For detailed cancellation charges, please refer to the cancellation policy section.',
    ];

    notes.forEach((note, index) => {
      // Bullet point
      doc.fillColor(colors.primary)
         .circle(x + 5, y + 7, 2)
         .fill();

      // Note text
      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray600)
         .text(note, x + 15, y, {
           width: width - 20,
           align: 'left',
           lineGap: 2
         });

      y = doc.y + 10;
    });
  }

  /**
   * Render prominent "Total Excluding TCS" display
   * @private
   */
  static renderTotalExcludingTCS(doc, totalExcludingTCS, x, y, width) {
    const boxHeight = 80;
    const boxPadding = 20;

    // Background with subtle gradient effect (layered rectangles)
    doc.roundedRect(x, y, width, boxHeight, 10)
       .fill(colors.primaryBg);

    doc.roundedRect(x, y + 40, width, boxHeight - 40, 10)
       .fillOpacity(0.5)
       .fill(colors.primaryLight)
       .fillOpacity(1);

    // Label
    doc.font(fonts.semibold)
       .fontSize(fontSize.h5)
       .fillColor(colors.gray700)
       .text('Total Cost (Excluding TCS)', x + boxPadding, y + boxPadding);

    // Amount (large and prominent)
    doc.font(fonts.bold)
       .fontSize(fontSize.h1 + 4)
       .fillColor(colors.primary)
       .text(
         this.formatAmount(totalExcludingTCS),
         x + boxPadding,
         y + boxPadding + 25
       );

    // Border
    doc.roundedRect(x, y, width, boxHeight, 10)
       .strokeColor(colors.primary)
       .lineWidth(2)
       .stroke();

    return y + boxHeight;
  }

  /**
   * Render TCS Information Box
   * @private
   */
  static renderTCSInfoBox(doc, booking, x, y, width) {
    const boxHeight = 85;
    const boxPadding = 15;

    // Use accent color from config, fallback to coral/orange
    const accentColor = colors.accent || '#ff6b35';

    // Background
    doc.roundedRect(x, y, width, boxHeight, 8)
       .fill(accentColor);

    // Heading
    doc.font(fonts.bold)
       .fontSize(fontSize.h5)
       .fillColor(colors.white)
       .text('Tax Collected at Source (TCS)', x + boxPadding, y + boxPadding);

    // TCS amount
    const tcsAmount = booking.tcsAmount || 0;
    const tcsPercentage = booking.tcsPercentage || 5;

    doc.font(fonts.semibold)
       .fontSize(fontSize.h3)
       .fillColor(colors.white)
       .text(
         this.formatAmount(tcsAmount),
         x + boxPadding,
         y + boxPadding + 24
       );

    // Explanation
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.white)
       .fillOpacity(0.9)
       .text(
         `${tcsPercentage}% TCS is applicable on foreign remittances as per government regulations.`,
         x + boxPadding,
         y + boxPadding + 52,
         { width: width - (boxPadding * 2), lineGap: 1 }
       )
       .fillOpacity(1);

    return y + boxHeight;
  }

  /**
   * Render "Pay Now" Call-to-Action Button
   * @private
   */
  static renderPayNowButton(doc, paymentLink, x, y, width) {
    const buttonHeight = 55;
    const buttonPadding = 15;

    // Button background (gradient effect with primary colors)
    doc.roundedRect(x, y, width, buttonHeight, 8)
       .fill(colors.primary);

    // Lighter overlay for gradient effect
    doc.roundedRect(x, y, width / 2, buttonHeight, 8)
       .fillOpacity(0.2)
       .fill(colors.primaryLight)
       .fillOpacity(1);

    // Button icon (payment symbol - using ASCII-safe character)
    doc.font('Helvetica-Bold')
       .fontSize(fontSize.h4)
       .fillColor(colors.white)
       .text('PAY', x + buttonPadding, y + buttonHeight / 2 - 8, {
         lineBreak: false
       });

    // Button text
    doc.font(fonts.bold)
       .fontSize(fontSize.h4)
       .fillColor(colors.white)
       .text('PAY NOW', x + 50, y + buttonHeight / 2 - 8, {
         width: width - 100
       });

    // Payment link (right side, smaller)
    doc.font(fonts.primary)
       .fontSize(fontSize.tiny)
       .fillColor(colors.white)
       .fillOpacity(0.85)
       .text('Secure Payment Gateway', x + buttonPadding, y + buttonHeight - 18, {
         width: width - (buttonPadding * 2),
         lineGap: 0
       })
       .fillOpacity(1);

    // Optional: Add clickable link text below button
    const linkY = y + buttonHeight + 10;
    doc.font(fonts.primary)
       .fontSize(fontSize.small)
       .fillColor(colors.primary)
       .text(
         `Payment Link: ${paymentLink.substring(0, 60)}${paymentLink.length > 60 ? '...' : ''}`,
         x + buttonPadding,
         linkY,
         { width: width - (buttonPadding * 2), underline: true }
       );

    return linkY + 25;
  }

  /**
   * Format amount with currency
   * @private
   */
  static formatAmount(amount) {
    if (typeof amount !== 'number') {
      return '₹0';
    }

    const prefix = amount < 0 ? '-' : '';
    const absAmount = Math.abs(amount);

    return `${prefix}₹${absAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  }
}

module.exports = PricingSection;
