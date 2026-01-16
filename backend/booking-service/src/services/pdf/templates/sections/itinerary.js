/**
 * Itinerary Section
 * Renders day-by-day travel itinerary with activities, meals, and accommodation
 */

const { colors, fonts, fontSize, spacing, icons } = require('../../../../config/pdf.config');

class ItinerarySection {
  /**
   * Render the itinerary section
   * @param {PDFDocument} doc - PDFKit document instance
   * @param {Object} data - Rendering data
   * @param {Object} data.package - Package details with itinerary
   * @param {Object} data.booking - Booking details
   * @param {Object} data.images - Pre-loaded images
   */
  static async render(doc, { package: pkg, booking, images }) {
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;
    const contentWidth = pageWidth - (margin * 2);

    // ========== SECTION HEADING ==========
    this.renderSectionHeader(doc, 'Day-by-Day Itinerary', margin);

    let currentY = doc.y + spacing.md;

    // Check if itinerary exists
    if (!pkg || !pkg.itinerary || pkg.itinerary.length === 0) {
      doc.font(fonts.primary)
         .fontSize(fontSize.body)
         .fillColor(colors.gray500)
         .text('No itinerary available for this package.', margin, currentY, {
           width: contentWidth,
           align: 'center'
         });

      // No itinerary - skip section without adding extra page
      return;
    }

    // ========== ITINERARY OVERVIEW TABLE ==========
    // "Your Itinerary at a Glance" table showing all days
    currentY = this.renderItineraryOverviewTable(doc, pkg, booking, margin, currentY, contentWidth);
    currentY += spacing.md;

    // Check if we need a new page before day cards
    const firstDay = pkg.itinerary[0];
    const firstCardHeight = this.estimateDayCardHeight(doc, firstDay, contentWidth);
    if (currentY + firstCardHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      currentY = doc.page.margins.top;
      this.renderSectionHeader(doc, 'Day-by-Day Itinerary (Detailed)', margin, currentY);
      currentY = doc.y + spacing.md;
    }

    // ========== RENDER EACH DAY ==========
    pkg.itinerary.forEach((day, index) => {
      const estimatedHeight = this.estimateDayCardHeight(doc, day, contentWidth);

      // Check if we need a new page
      if (currentY + estimatedHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      currentY = this.renderDayCard(doc, day, index + 1, margin, currentY, contentWidth, images);
      currentY += spacing.md;
    });

    // ========== PACKAGE HIGHLIGHTS (if available) ==========
    if (pkg.highlights && pkg.highlights.length > 0) {
      // Check if we need a new page
      if (currentY > doc.page.height - doc.page.margins.bottom - 250) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      // renderHighlights now includes its own styled header
      currentY = this.renderHighlights(doc, pkg.highlights, margin, currentY, contentWidth, images);
    }

    // ========== INCLUSIONS & EXCLUSIONS ==========
    if ((pkg.inclusions && pkg.inclusions.length > 0) || (pkg.exclusions && pkg.exclusions.length > 0)) {
      // Check if we need a new page
      if (currentY > doc.page.height - doc.page.margins.bottom - 400) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      this.renderSectionHeader(doc, 'Inclusions & Exclusions', margin, currentY);
      currentY = doc.y + spacing.md;

      currentY = this.renderInclusionsExclusions(doc, pkg, margin, currentY, contentWidth);
    }

    // ========== IMPORTANT INFORMATION BOX ==========
    if (pkg.importantInfo || true) { // Always show with default content if not provided
      currentY += spacing.md;

      // Check if we need a new page
      if (currentY > doc.page.height - doc.page.margins.bottom - 200) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      currentY = this.renderImportantInfoBox(doc, pkg, margin, currentY, contentWidth);
    }

    // Sync doc.y with calculated position for next section
    doc.y = currentY;

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
   * Estimate day card height for pagination checks
   * @private
   */
  static estimateDayCardHeight(doc, day, width) {
    const cardPadding = 15;
    let height = 0;

    // Image section and header bar
    height += 80; // imageHeight
    height += 50; // header bar + spacing

    // Description
    if (day.description) {
      doc.font(fonts.primary).fontSize(fontSize.body);
      const descHeight = doc.heightOfString(day.description, {
        width: width - (cardPadding * 2),
        lineGap: 3,
        align: 'justify'
      });
      height += descHeight + spacing.sm;
    }

    // Activity timeline bar
    if (day.activities && day.activities.length > 0) {
      height += 40 + spacing.md;
    }

    // Transfers
    if (day.transfers && day.transfers.length > 0) {
      height += spacing.sm;
      height += day.transfers.length * (60 + spacing.xs);
      height += spacing.sm;
    }

    // Activity cards
    if (day.activities && day.activities.length > 0) {
      height += spacing.sm;
      day.activities.forEach((activity) => {
        height += this.estimateActivityCardHeight(activity);
      });
      height += spacing.sm;
    }

    // Meals
    if (day.meals && (day.meals.breakfast || day.meals.lunch || day.meals.dinner)) {
      height += spacing.xs;
      const mealHeaderHeight = 18;
      const mealRowHeight = 18;
      height += mealHeaderHeight + (3 * mealRowHeight) + spacing.sm;
    }

    // Accommodation
    if (day.accommodation) {
      height += spacing.sm;
      doc.font(fonts.primary).fontSize(fontSize.small);
      const accommodationText = `Accommodation: ${day.accommodation}`;
      const accommodationHeight = doc.heightOfString(accommodationText, {
        width: width - (cardPadding * 2)
      });
      height += accommodationHeight + spacing.sm;
    }

    // Bottom padding
    height += cardPadding;

    return height;
  }

  /**
   * Estimate activity card height for pagination checks
   * @private
   */
  static estimateActivityCardHeight(activity) {
    const activityData = typeof activity === 'object' ? activity : { name: activity };
    const hasImage = activityData.imageUrl;
    const hasInclusionsExclusions = (activityData.inclusions && activityData.inclusions.length > 0) ||
                                    (activityData.exclusions && activityData.exclusions.length > 0);

    let cardHeight = 85;
    if (hasImage) cardHeight = Math.max(cardHeight, 105);
    if (hasInclusionsExclusions) cardHeight += 45;

    return cardHeight + spacing.xs;
  }

  /**
   * Render a single day card with enhanced visuals
   * @private
   */
  static renderDayCard(doc, day, dayNumber, x, y, width, images) {
    const cardPadding = 15;
    const cardStartY = y;
    let contentY = cardStartY;

    // ========== 1. HOTEL/DESTINATION IMAGE SECTION (80px) ==========
    const imageHeight = 80;
    const hasImage = images && images.packageImages && images.packageImages[dayNumber - 1];

    if (hasImage) {
      try {
        // Render package image
        doc.image(images.packageImages[dayNumber - 1], x, contentY, {
          width: width,
          height: imageHeight,
          fit: [width, imageHeight],
          align: 'center',
          valign: 'center'
        });
      } catch (error) {
        console.warn(`Failed to render image for day ${dayNumber}:`, error.message);
        // Fallback to gradient background
        this.renderImageFallback(doc, x, contentY, width, imageHeight, day.title || `Day ${dayNumber}`);
      }
    } else {
      // Gradient fallback background
      this.renderImageFallback(doc, x, contentY, width, imageHeight, day.title || `Day ${dayNumber}`);
    }

    contentY += imageHeight;

    // ========== 2. DAY HEADER BAR ==========
    doc.roundedRect(x, contentY, width, 45, 0)
       .fill(colors.primary);

    // Day number badge
    doc.font(fonts.bold)
       .fontSize(fontSize.h4)
       .fillColor(colors.white)
       .text(`Day ${dayNumber}`, x + cardPadding, contentY + 12);

    // Day title
    if (day.title) {
      doc.font(fonts.semibold)
         .fontSize(fontSize.body)
         .fillColor(colors.white)
         .text(day.title, x + 80, contentY + 15, {
           width: width - 100,
           ellipsis: true
         });
    }

    contentY += 50;

    // ========== 3. DESCRIPTION ==========
    if (day.description) {
      doc.font(fonts.primary)
         .fontSize(fontSize.body)
         .fillColor(colors.gray800)
         .text(day.description, x + cardPadding, contentY, {
           width: width - (cardPadding * 2),
           align: 'justify',
           lineGap: 3
         });

      contentY = doc.y + spacing.sm;
    }

    // ========== 4. ACTIVITY TIMELINE BAR ==========
    if (day.activities && day.activities.length > 0) {
      contentY = this.renderActivityTimelineBar(doc, day.activities, x, contentY, width, cardPadding);
    }

    // ========== 5. TRANSFERS (if any) ==========
    if (day.transfers && day.transfers.length > 0) {
      contentY += spacing.sm;

      day.transfers.forEach((transfer, transferIndex) => {
        contentY = this.renderTransferCard(doc, transfer, x, contentY, width, cardPadding);
      });

      contentY += spacing.sm;
    }

    // ========== 6. ACTIVITY CARDS ==========
    if (day.activities && day.activities.length > 0) {
      contentY += spacing.sm;

      day.activities.forEach((activity, activityIndex) => {
        contentY = this.renderActivityCard(doc, activity, activityIndex + 1, x, contentY, width, cardPadding);
      });

      contentY += spacing.sm;
    }

    // ========== 7. MEAL CHECKMARKS WITH VENUE INFO ==========
    if (day.meals && (day.meals.breakfast || day.meals.lunch || day.meals.dinner)) {
      contentY += spacing.xs;
      contentY = this.renderMealCheckmarks(doc, day.meals, x, contentY, width, cardPadding);
    }

    // ========== 8. ACCOMMODATION WITH STAR RATING ==========
    if (day.accommodation) {
      contentY += spacing.sm;
      contentY = this.renderAccommodation(doc, day.accommodation, day.hotelRating, x, contentY, width, cardPadding);
    }

    // Add bottom padding
    contentY += cardPadding;

    // Draw card border
    doc.roundedRect(x, cardStartY, width, contentY - cardStartY, 8)
       .strokeColor(colors.gray300)
       .lineWidth(1)
       .stroke();

    return contentY;
  }

  /**
   * Render image fallback (gradient background with title)
   * @private
   */
  static renderImageFallback(doc, x, y, width, height, title) {
    // Teal gradient simulation (light to dark)
    doc.rect(x, y, width, height).fill(colors.primaryBg);
    doc.rect(x, y + height - 30, width, 30).fill(colors.primaryLight);

    // Title text
    doc.font(fonts.semibold)
       .fontSize(fontSize.h4)
       .fillColor(colors.primary)
       .text(title, x + 15, y + (height / 2) - 10, {
         width: width - 30,
         align: 'center'
       });
  }

  /**
   * Render activity timeline bar (Morning/Afternoon/Evening)
   * @private
   */
  static renderActivityTimelineBar(doc, activities, x, y, width, padding) {
    const barHeight = 40;
    const barWidth = width - (padding * 2);
    const segmentWidth = barWidth / 3;
    const barX = x + padding;

    // Determine which time slots have activities
    const timeSlots = { morning: false, afternoon: false, evening: false };

    activities.forEach(activity => {
      if (typeof activity === 'object' && activity.time) {
        const time = activity.time.toLowerCase();
        if (time.includes('morning')) timeSlots.morning = true;
        else if (time.includes('afternoon')) timeSlots.afternoon = true;
        else if (time.includes('evening')) timeSlots.evening = true;
      } else {
        // If no time specified, mark all as active
        timeSlots.morning = true;
        timeSlots.afternoon = true;
        timeSlots.evening = true;
      }
    });

    const segments = [
      { label: 'Morning', active: timeSlots.morning },
      { label: 'Afternoon', active: timeSlots.afternoon },
      { label: 'Evening', active: timeSlots.evening }
    ];

    segments.forEach((segment, index) => {
      const segmentX = barX + (index * segmentWidth);
      const segmentColor = segment.active ? colors.primary : colors.gray200;

      // Segment background
      doc.rect(segmentX, y, segmentWidth, barHeight)
         .fill(segmentColor);

      // Segment label
      doc.font(fonts.semibold)
         .fontSize(fontSize.small)
         .fillColor(segment.active ? colors.white : colors.gray500)
         .text(segment.label, segmentX, y + 14, {
           width: segmentWidth,
           align: 'center'
         });

      // Separator line (except for last segment)
      if (index < segments.length - 1) {
        doc.moveTo(segmentX + segmentWidth, y)
           .lineTo(segmentX + segmentWidth, y + barHeight)
           .strokeColor(colors.white)
           .lineWidth(1)
           .stroke();
      }
    });

    // Timeline bar border
    doc.rect(barX, y, barWidth, barHeight)
       .strokeColor(colors.gray300)
       .lineWidth(1)
       .stroke();

    return y + barHeight + spacing.md;
  }

  /**
   * Render individual activity card with image, details, and inclusions/exclusions
   * @private
   */
  static renderActivityCard(doc, activity, activityNumber, x, y, width, padding) {
    const cardX = x + padding;
    const cardWidth = width - (padding * 2);
    const cardPadding = 10;

    // Get activity data (support both string and object formats)
    const activityData = typeof activity === 'object' ? activity : { name: activity };
    const hasImage = activityData.imageUrl;
    const hasInclusionsExclusions = (activityData.inclusions && activityData.inclusions.length > 0) ||
                                    (activityData.exclusions && activityData.exclusions.length > 0);

    // Calculate card height dynamically
    let cardHeight = 85; // Base height
    if (hasImage) cardHeight = Math.max(cardHeight, 105); // Account for image
    if (hasInclusionsExclusions) cardHeight += 45; // Add space for inclusions/exclusions

    // Alternating background colors
    const bgColor = activityNumber % 2 === 0 ? colors.white : colors.gray50;

    // Card background
    doc.rect(cardX, y, cardWidth, cardHeight)
       .fill(bgColor);

    let contentX = cardX + cardPadding;
    let contentY = y + cardPadding;

    // ===== IMAGE SECTION (if available) =====
    const imageWidth = 150;
    const imageHeight = 85;

    if (hasImage) {
      try {
        // Render activity image
        doc.image(activityData.imageUrl, contentX, contentY, {
          width: imageWidth,
          height: imageHeight,
          fit: [imageWidth, imageHeight]
        });
      } catch (error) {
        // Fallback: gradient placeholder
        doc.rect(contentX, contentY, imageWidth, imageHeight)
           .fill(colors.primaryBg);

        doc.font(fonts.bold)
           .fontSize(fontSize.small)
           .fillColor(colors.primary)
           .text('Activity', contentX, contentY + imageHeight / 2 - 5, {
             width: imageWidth,
             align: 'center'
           });
      }

      // Image border
      doc.rect(contentX, contentY, imageWidth, imageHeight)
         .strokeColor(colors.gray300)
         .lineWidth(0.5)
         .stroke();

      contentX += imageWidth + 12;
    } else {
      // Numbered circle icon (if no image)
      const circleX = contentX + 12;
      const circleY = contentY + 12;
      doc.circle(circleX, circleY, 12)
         .fill(colors.primary);

      doc.font(fonts.bold)
         .fontSize(fontSize.small)
         .fillColor(colors.white)
         .text(activityNumber.toString(), circleX - 6, circleY - 5, {
           lineBreak: false
         });

      contentX += 35;
    }

    // ===== ACTIVITY DETAILS (right of image/icon) =====
    const detailsWidth = cardWidth - (contentX - cardX) - cardPadding;

    // Activity name
    doc.font(fonts.semibold)
       .fontSize(fontSize.body)
       .fillColor(colors.gray900)
       .text(activityData.name, contentX, contentY, {
         width: detailsWidth,
         ellipsis: true
       });

    let detailY = contentY + 20;

    // Activity time
    if (activityData.time) {
      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray600)
         .text(`Time: ${activityData.time}`, contentX, detailY, {
           lineBreak: false
         });
      detailY += 16;
    }

    // Activity duration
    if (activityData.duration) {
      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray600)
         .text(`Duration: ${activityData.duration}`, contentX, detailY, {
           lineBreak: false
         });
      detailY += 16;
    }

    // ===== INCLUSIONS & EXCLUSIONS BOXES (below details) =====
    if (hasInclusionsExclusions) {
      const boxesY = y + cardHeight - 40;
      const boxWidth = (cardWidth - (cardPadding * 3)) / 2;
      const boxHeight = 35;

      // Inclusions box (left)
      if (activityData.inclusions && activityData.inclusions.length > 0) {
        doc.roundedRect(cardX + cardPadding, boxesY, boxWidth, boxHeight, 4)
           .fill(colors.success)
           .fillOpacity(0.1)
           .fill()
           .fillOpacity(1);

        doc.roundedRect(cardX + cardPadding, boxesY, boxWidth, boxHeight, 4)
           .strokeColor(colors.success)
           .lineWidth(1)
           .stroke();

        doc.font(fonts.semibold)
           .fontSize(fontSize.tiny)
           .fillColor(colors.success)
           .text('Included:', cardX + cardPadding + 6, boxesY + 5, {
             lineBreak: false
           });

        const inclusionsText = activityData.inclusions.slice(0, 2).join(', ');
        const suffix = activityData.inclusions.length > 2 ? '...' : '';

        doc.font(fonts.primary)
           .fontSize(fontSize.tiny)
           .fillColor(colors.gray800)
           .text(inclusionsText + suffix, cardX + cardPadding + 6, boxesY + 18, {
             width: boxWidth - 12,
             ellipsis: true
           });
      }

      // Exclusions box (right)
      if (activityData.exclusions && activityData.exclusions.length > 0) {
        const exclusionsX = cardX + cardPadding + boxWidth + cardPadding;

        doc.roundedRect(exclusionsX, boxesY, boxWidth, boxHeight, 4)
           .fill(colors.error)
           .fillOpacity(0.1)
           .fill()
           .fillOpacity(1);

        doc.roundedRect(exclusionsX, boxesY, boxWidth, boxHeight, 4)
           .strokeColor(colors.error)
           .lineWidth(1)
           .stroke();

        doc.font(fonts.semibold)
           .fontSize(fontSize.tiny)
           .fillColor(colors.error)
           .text('Excluded:', exclusionsX + 6, boxesY + 5, {
             lineBreak: false
           });

        const exclusionsText = activityData.exclusions.slice(0, 2).join(', ');
        const suffix = activityData.exclusions.length > 2 ? '...' : '';

        doc.font(fonts.primary)
           .fontSize(fontSize.tiny)
           .fillColor(colors.gray800)
           .text(exclusionsText + suffix, exclusionsX + 6, boxesY + 18, {
             width: boxWidth - 12,
             ellipsis: true
           });
      }
    }

    // Card border
    doc.rect(cardX, y, cardWidth, cardHeight)
       .strokeColor(colors.gray200)
       .lineWidth(0.5)
       .stroke();

    return y + cardHeight + spacing.xs;
  }

  /**
   * Render meal checkmarks with venue information
   * Shows "✓ Breakfast: Included at Hotel" or "✗ Lunch: Not Included"
   * @private
   */
  static renderMealCheckmarks(doc, meals, x, y, width, padding) {
    let currentY = y;

    const mealConfig = [
      { key: 'breakfast', label: 'Breakfast' },
      { key: 'lunch', label: 'Lunch' },
      { key: 'dinner', label: 'Dinner' }
    ];

    // Section header
    doc.font(fonts.semibold)
       .fontSize(fontSize.small)
       .fillColor(colors.gray700)
       .text('Day Meals:', x + padding, currentY);

    currentY += 18;

    mealConfig.forEach(mealType => {
      const mealData = meals[mealType.key];

      // Determine if meal is included (support both boolean and object formats)
      const isIncluded = typeof mealData === 'object' ? mealData.included : !!mealData;
      const venue = typeof mealData === 'object' ? mealData.venue : null;

      // Checkmark/X icon
      const iconX = x + padding + 2;
      const iconY = currentY + 6;
      const iconColor = isIncluded ? colors.success : colors.gray400;

      doc.circle(iconX, iconY, 7)
         .strokeColor(iconColor)
         .lineWidth(1.5)
         .stroke();

      // Checkmark or X symbol
      if (isIncluded) {
        // Checkmark (✓)
        doc.font(fonts.bold)
           .fontSize(fontSize.small)
           .fillColor(colors.success)
           .text('✓', iconX - 4, iconY - 5, {
             lineBreak: false
           });
      } else {
        // X symbol (×)
        doc.font(fonts.bold)
           .fontSize(fontSize.small)
           .fillColor(colors.gray400)
           .text('×', iconX - 4, iconY - 6, {
             lineBreak: false
           });
      }

      // Meal label and venue info
      const textX = x + padding + 18;

      doc.font(fonts.semibold)
         .fontSize(fontSize.small)
         .fillColor(colors.gray800)
         .text(`${mealType.label}: `, textX, currentY, {
           lineBreak: false,
           continued: true
         });

      if (isIncluded) {
        const venueText = venue ? `Included at ${venue}` : 'Included';
        doc.font(fonts.primary)
           .fillColor(colors.gray700)
           .text(venueText, {
             width: width - (textX - x) - padding,
             ellipsis: true
           });
      } else {
        doc.font(fonts.primary)
           .fillColor(colors.gray500)
           .text('Not Included', {
             lineBreak: false
           });
      }

      currentY += 18;
    });

    return currentY + spacing.sm;
  }

  /**
   * Render transfer card with visual distinction
   * Light blue background to differentiate from activities
   * @private
   */
  static renderTransferCard(doc, transfer, x, y, width, padding) {
    const cardX = x + padding;
    const cardWidth = width - (padding * 2);
    const cardHeight = 60;
    const cardPadding = 12;

    // Get transfer data (support both string and object formats)
    const transferData = typeof transfer === 'object' ? transfer : { route: transfer };

    // Light blue background (distinct from activities)
    const transferBgColor = '#e0f2fe'; // Light blue
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 6)
       .fill(transferBgColor);

    // Car/Transfer icon
    const iconX = cardX + cardPadding;
    const iconY = y + cardHeight / 2;

    doc.roundedRect(iconX, iconY - 12, 24, 24, 4)
       .fill(colors.primary);

    doc.font(fonts.bold)
       .fontSize(fontSize.small)
       .fillColor(colors.white)
       .text('T', iconX + 8, iconY - 6, {
         lineBreak: false
       });

    // Transfer details
    const detailsX = iconX + 35;
    const detailsY = y + cardPadding;

    // Transfer type/route
    const route = transferData.route || transferData.type || 'Transfer';
    doc.font(fonts.semibold)
       .fontSize(fontSize.body)
       .fillColor(colors.gray900)
       .text(route, detailsX, detailsY, {
         width: cardWidth - 60,
         ellipsis: true
       });

    // Duration and vehicle type (if available)
    let subDetailsY = detailsY + 18;

    if (transferData.duration) {
      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray600)
         .text(`Duration: ${transferData.duration}`, detailsX, subDetailsY, {
           lineBreak: false,
           continued: transferData.vehicle ? true : false
         });

      if (transferData.vehicle) {
        doc.text(` • ${transferData.vehicle}`);
      }
    } else if (transferData.vehicle) {
      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray600)
         .text(`Vehicle: ${transferData.vehicle}`, detailsX, subDetailsY, {
           lineBreak: false
         });
    }

    // Card border (blue tint)
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 6)
       .strokeColor(colors.primary)
       .lineWidth(1)
       .stroke();

    return y + cardHeight + spacing.xs;
  }

  /**
   * Render accommodation with hotel star rating
   * @private
   */
  static renderAccommodation(doc, accommodation, hotelRating, x, y, width, padding) {
    doc.font(fonts.semibold)
       .fontSize(fontSize.small)
       .fillColor(colors.gray600)
       .text('Accommodation: ', x + padding, y, {
         lineBreak: false,
         continued: true
       });

    doc.font(fonts.primary)
       .fillColor(colors.gray900)
       .text(accommodation, {
         lineBreak: false,
         continued: hotelRating ? true : false
       });

    // Hotel star rating
    if (hotelRating && hotelRating > 0) {
      const stars = Math.min(hotelRating, 5); // Cap at 5 stars
      const starText = ' ' + icons.star.repeat(stars);

      doc.font(fonts.primary)
         .fillColor(colors.amber)
         .text(starText);
    }

    return doc.y + spacing.sm;
  }

  /**
   * Render package highlights with images (MakeMyTrip-style)
   * @private
   */
  static renderHighlights(doc, highlights, x, y, width, images = {}) {
    let currentY = y;

    // ========== "PACKAGE HIGHLIGHTS" BANNER HEADER ==========
    const headerHeight = 45;
    const bannerY = currentY;

    // Decorative wave element (left side accent)
    doc.save();
    doc.moveTo(x, bannerY)
       .lineTo(x + 4, bannerY)
       .lineTo(x + 4, bannerY + headerHeight)
       .lineTo(x, bannerY + headerHeight)
       .closePath()
       .fill(colors.primary);
    doc.restore();

    // Header text
    doc.font(fonts.bold)
       .fontSize(fontSize.h3)
       .fillColor(colors.gray900)
       .text('PACKAGE HIGHLIGHTS', x + 15, bannerY + 12);

    // Decorative underline
    doc.moveTo(x + 15, bannerY + 37)
       .lineTo(x + 180, bannerY + 37)
       .strokeColor(colors.primary)
       .lineWidth(2)
       .stroke();

    currentY += headerHeight + spacing.md;

    // ========== HIGHLIGHTS GRID (2 COLUMNS) ==========
    const columnWidth = (width - spacing.md) / 2;
    const cardHeight = 110; // Fixed height for consistency
    const cardPadding = 10;
    const imageWidth = 120;
    const imageHeight = 80;

    // Track row Y position separately for proper grid rendering
    let rowY = currentY;

    highlights.forEach((highlight, index) => {
      // Parse highlight data (support both string and object formats)
      const highlightData = typeof highlight === 'string'
        ? { title: highlight, description: null, imageUrl: null }
        : {
            title: highlight.title || highlight,
            description: highlight.description || null,
            imageUrl: highlight.imageUrl || null,
            icon: highlight.icon || '★'
          };

      // Calculate position in grid
      const columnIndex = index % 2;
      const isNewRow = columnIndex === 0 && index > 0;

      // Advance to next row for left column (except first item)
      if (isNewRow) {
        rowY += cardHeight + spacing.sm;
      }

      // Check if we need a new page
      if (rowY + cardHeight > doc.page.height - doc.page.margins.bottom - 80) {
        doc.addPage();
        rowY = doc.page.margins.top;
        currentY = rowY;
      }

      const cardX = x + (columnIndex * (columnWidth + spacing.md));
      const cardY = rowY;  // Both columns use same row Y position

      this.renderHighlightCard(doc, highlightData, cardX, cardY, columnWidth, cardHeight, imageWidth, imageHeight, cardPadding, images);
    });

    // Update currentY to position after the grid
    currentY = rowY + cardHeight + spacing.md;

    return currentY;
  }

  /**
   * Render individual highlight card with image thumbnail
   * @private
   */
  static renderHighlightCard(doc, highlightData, x, y, width, height, imageWidth, imageHeight, padding, images) {
    // Card background
    doc.roundedRect(x, y, width, height, 6)
       .fill(colors.white);

    // Card border
    doc.roundedRect(x, y, width, height, 6)
       .strokeColor(colors.gray300)
       .lineWidth(1)
       .stroke();

    // ========== IMAGE SECTION (LEFT SIDE) ==========
    const imageX = x + padding;
    const imageY = y + padding;

    if (highlightData.imageUrl && images.packageImages && images.packageImages.length > 0) {
      try {
        // Try to find matching image from preloaded package images
        // For now, use placeholder logic until image matching is implemented
        const hasImage = false; // Placeholder - will be enhanced when image loading is added

        if (hasImage) {
          doc.image(images.packageImages[0], imageX, imageY, {
            width: imageWidth,
            height: imageHeight,
            fit: [imageWidth, imageHeight]
          });
        } else {
          // Fallback: Colored icon box
          this.renderHighlightIconBox(doc, highlightData.icon, imageX, imageY, imageWidth, imageHeight);
        }
      } catch (error) {
        console.warn('Failed to render highlight image:', error.message);
        this.renderHighlightIconBox(doc, highlightData.icon, imageX, imageY, imageWidth, imageHeight);
      }
    } else {
      // No image available - render colored icon box
      this.renderHighlightIconBox(doc, highlightData.icon, imageX, imageY, imageWidth, imageHeight);
    }

    // ========== TEXT SECTION (RIGHT SIDE) ==========
    const textX = imageX + imageWidth + padding;
    const textWidth = width - imageWidth - (padding * 3);
    let textY = imageY;

    // Highlight title (bold)
    doc.font(fonts.semibold)
       .fontSize(fontSize.h5)
       .fillColor(colors.gray900)
       .text(highlightData.title, textX, textY, {
         width: textWidth,
         lineGap: 2,
         ellipsis: true
       });

    textY = doc.y + 6;

    // Highlight description (if available)
    if (highlightData.description) {
      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray600)
         .text(highlightData.description, textX, textY, {
           width: textWidth,
           lineGap: 1.5,
           ellipsis: true
         });
    }
  }

  /**
   * Render colored icon box as fallback when no image available
   * @private
   */
  static renderHighlightIconBox(doc, icon, x, y, width, height) {
    // Gradient-style background (layered rectangles)
    doc.roundedRect(x, y, width, height, 4)
       .fill(colors.primaryBg);

    doc.roundedRect(x, y + (height / 2), width, height / 2, 4)
       .fillOpacity(0.5)
       .fill(colors.primaryLight)
       .fillOpacity(1);

    // Icon/symbol (centered)
    const iconSize = 32;
    const iconX = x + (width / 2);
    const iconY = y + (height / 2) - (iconSize / 2);

    doc.font(fonts.bold)
       .fontSize(iconSize)
       .fillColor(colors.primary)
       .text(icon || '★', iconX - 16, iconY, {
         width: 32,
         align: 'center',
         lineBreak: false
       });

    // Border
    doc.roundedRect(x, y, width, height, 4)
       .strokeColor(colors.primary)
       .lineWidth(1.5)
       .stroke();
  }

  /**
   * Render inclusions and exclusions
   * @private
   */
  static renderInclusionsExclusions(doc, pkg, x, y, width) {
    let currentY = y;
    const columnWidth = (width - spacing.lg) / 2;
    const leftColX = x;
    const rightColX = x + columnWidth + spacing.lg;

    // ========== INCLUSIONS ==========
    if (pkg.inclusions && pkg.inclusions.length > 0) {
      // Inclusions heading
      doc.font(fonts.bold)
         .fontSize(fontSize.h4)
         .fillColor(colors.primary)
         .text('What\'s Included', leftColX, currentY);

      let inclusionsY = currentY + 30;

      pkg.inclusions.forEach(item => {
        // Check if we need a new page
        if (inclusionsY > doc.page.height - doc.page.margins.bottom - 80) {
          doc.addPage();
          inclusionsY = doc.page.margins.top;
        }

        // Checkmark
        doc.fillColor(colors.success)
           .circle(leftColX + 6, inclusionsY + 7, 4)
           .fill();

        doc.fillColor(colors.white)
           .fontSize(7)
           .text(icons.checkmark, leftColX + 3, inclusionsY + 3);

        // Item text
        doc.font(fonts.primary)
           .fontSize(fontSize.body)
           .fillColor(colors.gray800)
           .text(item, leftColX + 20, inclusionsY, {
             width: columnWidth - 25,
             lineGap: 2
           });

        inclusionsY = doc.y + 12;
      });
    }

    // ========== EXCLUSIONS ==========
    if (pkg.exclusions && pkg.exclusions.length > 0) {
      // Exclusions heading
      doc.font(fonts.bold)
         .fontSize(fontSize.h4)
         .fillColor(colors.error)
         .text('What\'s Not Included', rightColX, currentY);

      let exclusionsY = currentY + 30;

      pkg.exclusions.forEach(item => {
        // Check if we need a new page
        if (exclusionsY > doc.page.height - doc.page.margins.bottom - 80) {
          doc.addPage();
          exclusionsY = doc.page.margins.top;
        }

        // Cross icon
        doc.fillColor(colors.error)
           .circle(rightColX + 6, exclusionsY + 7, 4)
           .fill();

        doc.fillColor(colors.white)
           .fontSize(7)
           .text(icons.cross, rightColX + 4, exclusionsY + 3);

        // Item text
        doc.font(fonts.primary)
           .fontSize(fontSize.body)
           .fillColor(colors.gray800)
           .text(item, rightColX + 20, exclusionsY, {
             width: columnWidth - 25,
             lineGap: 2
           });

        exclusionsY = doc.y + 12;
      });
    }

    // Return the maximum Y position
    return Math.max(doc.y, currentY + 300);
  }

  /**
   * Render Important Information box with coral/orange background
   * @private
   */
  static renderImportantInfoBox(doc, pkg, x, y, width) {
    const boxPadding = 20;
    const accentColor = colors.accent || '#ff6b35';

    // Default information text
    const defaultInfo = 'Please carry valid government-issued ID proof. Check visa requirements for international travel. Arrive at meeting points 15 minutes early.';
    const infoText = pkg.importantInfo || defaultInfo;

    // Calculate required box height based on text length
    doc.font(fonts.primary).fontSize(fontSize.body);
    const textHeight = doc.heightOfString(infoText, {
      width: width - (boxPadding * 2),
      lineGap: 3
    });

    const boxHeight = Math.max(100, textHeight + 70); // Minimum 100px, or text height + padding

    // ========== BACKGROUND ==========
    doc.roundedRect(x, y, width, boxHeight, 10)
       .fill(accentColor);

    // ========== HEADING WITH ICON ==========
    doc.font(fonts.bold)
       .fontSize(fontSize.h4)
       .fillColor(colors.white)
       .text('⚠ IMPORTANT INFORMATION', x + boxPadding, y + boxPadding, {
         lineBreak: false
       });

    // ========== CONTENT TEXT ==========
    doc.font(fonts.primary)
       .fontSize(fontSize.body)
       .fillColor(colors.white)
       .text(infoText, x + boxPadding, y + boxPadding + 30, {
         width: width - (boxPadding * 2),
         lineGap: 3,
         align: 'left'
       });

    // ========== DECORATIVE BORDER ==========
    doc.roundedRect(x, y, width, boxHeight, 10)
       .strokeColor(colors.white)
       .lineWidth(2)
       .stroke();

    return y + boxHeight;
  }

  /**
   * Render itinerary overview table - "Your Itinerary at a Glance"
   * Shows all days in tabular format with dates, activities, meals, transfers
   * @private
   */
  static renderItineraryOverviewTable(doc, pkg, booking, x, y, width) {
    let currentY = y;

    // Subsection header
    doc.font(fonts.semibold)
       .fontSize(fontSize.h4)
       .fillColor(colors.gray800)
       .text('Your Itinerary at a Glance', x, currentY);

    currentY += 30;

    // Calculate start date (from package or booking)
    const startDate = pkg.startDate || booking.travelDate;
    const hasTransfers = pkg.itinerary.some(day =>
      day.transfers ||
      (day.activities && Array.isArray(day.activities) && day.activities.some(act =>
        typeof act === 'string' ? act.toLowerCase().includes('transfer') :
        act.name && act.name.toLowerCase().includes('transfer')
      ))
    );

    // Table configuration
    const rowHeight = 35;
    const headerHeight = 40;
    const cellPadding = 8;

    // Column widths (adjusted based on whether transfers column is shown)
    let colWidths;
    if (hasTransfers) {
      colWidths = {
        day: width * 0.10,        // 10% - Day number
        date: width * 0.20,       // 20% - Date
        activities: width * 0.35, // 35% - Activities summary
        meals: width * 0.20,      // 20% - Meals
        transfers: width * 0.15   // 15% - Transfers
      };
    } else {
      colWidths = {
        day: width * 0.12,        // 12% - Day number
        date: width * 0.23,       // 23% - Date
        activities: width * 0.42, // 42% - Activities summary
        meals: width * 0.23,      // 23% - Meals
        transfers: 0              // Not shown
      };
    }

    // Column X positions
    const colX = {
      day: x,
      date: x + colWidths.day,
      activities: x + colWidths.day + colWidths.date,
      meals: x + colWidths.day + colWidths.date + colWidths.activities,
      transfers: x + colWidths.day + colWidths.date + colWidths.activities + colWidths.meals
    };

    // ========== TABLE HEADER ==========
    doc.rect(x, currentY, width, headerHeight)
       .fill(colors.primary);

    // Header text
    const headerY = currentY + (headerHeight / 2) - 6;

    doc.font(fonts.bold)
       .fontSize(fontSize.small)
       .fillColor(colors.white);

    doc.text('Day', colX.day + cellPadding, headerY, {
      width: colWidths.day - cellPadding,
      align: 'center',
      lineBreak: false
    });

    doc.text('Date', colX.date + cellPadding, headerY, {
      width: colWidths.date - (cellPadding * 2),
      align: 'center',
      lineBreak: false
    });

    doc.text('Activities', colX.activities + cellPadding, headerY, {
      width: colWidths.activities - (cellPadding * 2),
      align: 'center',
      lineBreak: false
    });

    doc.text('Meals', colX.meals + cellPadding, headerY, {
      width: colWidths.meals - (cellPadding * 2),
      align: 'center',
      lineBreak: false
    });

    if (hasTransfers) {
      doc.text('Transfers', colX.transfers + cellPadding, headerY, {
        width: colWidths.transfers - cellPadding,
        align: 'center',
        lineBreak: false
      });
    }

    currentY += headerHeight;

    // ========== TABLE ROWS ==========
    pkg.itinerary.forEach((day, index) => {
      // Alternating row colors
      const rowBg = index % 2 === 0 ? colors.white : colors.gray50;

      doc.rect(x, currentY, width, rowHeight)
         .fill(rowBg);

      const textY = currentY + (rowHeight / 2) - 7;

      // Day number
      doc.font(fonts.bold)
         .fontSize(fontSize.small)
         .fillColor(colors.primary)
         .text(`${index + 1}`, colX.day + cellPadding, textY, {
           width: colWidths.day - (cellPadding * 2),
           align: 'center',
           lineBreak: false
         });

      // Date (calculated if startDate exists)
      let dateText = '-';
      if (startDate) {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + index);
        dateText = dayDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short'
        });
      } else if (day.date) {
        dateText = new Date(day.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short'
        });
      }

      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray800)
         .text(dateText, colX.date + cellPadding, textY, {
           width: colWidths.date - (cellPadding * 2),
           align: 'center',
           lineBreak: false
         });

      // Activities summary
      let activitiesSummary = day.title || 'Activities';
      if (day.activities && day.activities.length > 0) {
        // Get first activity name
        const firstActivity = Array.isArray(day.activities) ? day.activities[0] : day.activities;
        if (typeof firstActivity === 'object' && firstActivity.name) {
          activitiesSummary = firstActivity.name;
        } else if (typeof firstActivity === 'string') {
          activitiesSummary = firstActivity;
        }

        // Add count if multiple activities
        if (day.activities.length > 1) {
          activitiesSummary += ` +${day.activities.length - 1} more`;
        }
      }

      doc.font(fonts.primary)
         .fontSize(fontSize.small)
         .fillColor(colors.gray800)
         .text(activitiesSummary, colX.activities + cellPadding, textY, {
           width: colWidths.activities - (cellPadding * 2),
           ellipsis: true,
           lineBreak: false
         });

      // Meals (icon representation)
      const mealsText = this.getMealsShorthand(day.meals);
      doc.font(fonts.primary)
         .fontSize(fontSize.tiny)
         .fillColor(colors.gray700)
         .text(mealsText, colX.meals + cellPadding, textY, {
           width: colWidths.meals - (cellPadding * 2),
           align: 'center',
           lineBreak: false
         });

      // Transfers (if applicable)
      if (hasTransfers) {
        const hasTransfer = day.transfers ||
          (day.activities && Array.isArray(day.activities) && day.activities.some(act =>
            typeof act === 'string' ? act.toLowerCase().includes('transfer') :
            act.name && act.name.toLowerCase().includes('transfer')
          ));

        const transferText = hasTransfer ? 'Included' : '-';
        doc.font(fonts.primary)
           .fontSize(fontSize.tiny)
           .fillColor(hasTransfer ? colors.success : colors.gray400)
           .text(transferText, colX.transfers + cellPadding, textY, {
             width: colWidths.transfers - (cellPadding * 2),
             align: 'center',
             lineBreak: false
           });
      }

      currentY += rowHeight;
    });

    // Table border
    doc.rect(x, y + 30, width, headerHeight + (pkg.itinerary.length * rowHeight))
       .strokeColor(colors.gray300)
       .lineWidth(1)
       .stroke();

    // Column dividers (vertical lines)
    const tableTop = y + 30;
    const tableBottom = currentY;

    doc.moveTo(colX.date, tableTop)
       .lineTo(colX.date, tableBottom)
       .strokeColor(colors.gray200)
       .lineWidth(0.5)
       .stroke();

    doc.moveTo(colX.activities, tableTop)
       .lineTo(colX.activities, tableBottom)
       .strokeColor(colors.gray200)
       .lineWidth(0.5)
       .stroke();

    doc.moveTo(colX.meals, tableTop)
       .lineTo(colX.meals, tableBottom)
       .strokeColor(colors.gray200)
       .lineWidth(0.5)
       .stroke();

    if (hasTransfers) {
      doc.moveTo(colX.transfers, tableTop)
         .lineTo(colX.transfers, tableBottom)
         .strokeColor(colors.gray200)
         .lineWidth(0.5)
         .stroke();
    }

    return currentY;
  }

  /**
   * Get shorthand representation of meals (e.g., "B, L, D" or "B, D")
   * @private
   */
  static getMealsShorthand(meals) {
    if (!meals) return '-';

    const included = [];
    if (meals.breakfast) included.push('B');
    if (meals.lunch) included.push('L');
    if (meals.dinner) included.push('D');

    return included.length > 0 ? included.join(', ') : '-';
  }
}

module.exports = ItinerarySection;
