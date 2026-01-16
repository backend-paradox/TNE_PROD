# 📄 PDF Generation - Testing Guide

## Quick Start - Preview with Mock Data

### Method 1: Using Test HTML Page (Easiest)

1. **Start the booking-service backend:**
   ```bash
   cd backend/booking-service
   npm start
   ```

2. **Open the test page:**
   - Open `test-pdf-preview.html` in your browser
   - Click "Download Preview PDF" button
   - PDF will download automatically

3. **View the PDF:**
   - Open the downloaded `TNE-PKG-20260107ABCD-PREVIEW.pdf`
   - Check all sections: Cover, Booking Info, Itinerary, Pricing, Policies

### Method 2: Direct API Call

**Using Browser:**
```
http://localhost:5000/api/v1/bookings/test-pdf
```

**Using cURL:**
```bash
curl -o preview.pdf http://localhost:5000/api/v1/bookings/test-pdf
```

**Using Postman/Thunder Client:**
- GET `http://localhost:5000/api/v1/bookings/test-pdf`
- Save response as PDF file

---

## PDF Preview Contents

The test PDF includes a complete **7-day Kashmir tour package** with:

### 📄 Cover Page
- Trip & Event branding and logo
- Package title: "Magical Kashmir - Valley of Paradise"
- Booking reference number
- Booking status and traveler count
- Travel dates

### 👥 Booking Summary
- Booking details table (ID, status, date, type)
- Traveler information:
  - Mr. Rajesh Kumar (35, Male, Passport: M1234567)
  - Mrs. Priya Kumar (32, Female, Passport: M1234568)
  - Master Aarav Kumar (8, Male, Birth Certificate)
- Contact information

### 🗓️ Day-by-Day Itinerary
7 detailed day cards with:
- **Day 1:** Arrival in Srinagar - Dal Lake (Shikara ride, floating gardens)
- **Day 2:** Mughal Gardens Tour (Nishat Bagh, Shalimar Bagh)
- **Day 3:** Srinagar to Gulmarg (Gondola ride, snow activities)
- **Day 4:** Gulmarg to Pahalgam (Saffron fields, Lidder River)
- **Day 5:** Betaab Valley & Aru Valley (Horse riding, trekking)
- **Day 6:** Pahalgam to Srinagar via Sonmarg (Thajiwas Glacier)
- **Day 7:** Departure from Srinagar

Each day includes:
- Activities list with icons
- Meals (breakfast/lunch/dinner)
- Accommodation details

### ✨ Package Highlights
10 key highlights:
- Shikara ride on Dal Lake
- Gondola cable car in Gulmarg
- Visit to Betaab Valley
- Traditional Kashmiri Wazwan dinner
- And more...

### ✅ Inclusions & Exclusions
Two-column layout with:
- **Included:** Accommodation, meals, transfers, guide, etc.
- **Excluded:** Airfare, insurance, adventure activities, etc.

### 💰 Pricing Breakdown
Detailed cost table:
- Package cost: ₹45,000
- Tax (18%): ₹8,100
- **Total:** ₹53,100
- Amount paid: ₹20,000
- Balance due: ₹33,100

Payment history with transaction details

### 📋 Policies
- **Cancellation Policy:** Timeline with refund percentages
  - >30 days: 100% refund
  - 15-30 days: 50% refund
  - 7-15 days: 25% refund
  - <7 days: No refund
- **Date Change Policy:** Fees based on timeline
- **Terms & Conditions:** 8 important points
- **Contact Section:** Phone, email, website

---

## Checklist for Design Review

After generating the PDF, check:

- [ ] **Branding**
  - [ ] Trip & Event logo appears correctly
  - [ ] Teal color scheme (#0d9488, #14b8a6) is used
  - [ ] Company name and taglines are visible

- [ ] **Typography**
  - [ ] Poppins fonts load correctly
  - [ ] Text is readable and properly sized
  - [ ] No text overflow or truncation

- [ ] **Layout**
  - [ ] All pages are properly formatted (A4 size)
  - [ ] Page numbers appear in footer
  - [ ] Sections are well-spaced
  - [ ] No content cutoff at page breaks

- [ ] **Content**
  - [ ] All 7 itinerary days render correctly
  - [ ] Traveler table shows all 3 travelers
  - [ ] Pricing breakdown is accurate
  - [ ] Policy timeline displays with colors
  - [ ] Contact information is correct

- [ ] **Visual Elements**
  - [ ] Icons appear for activities, meals, etc.
  - [ ] Color-coded status badges
  - [ ] Tables have proper borders and shading
  - [ ] Gradient backgrounds on cover page

---

## Troubleshooting

### Issue: PDF download fails
**Solution:**
1. Check if booking-service is running: `npm start`
2. Verify port 5000 is not in use
3. Check console for error logs

### Issue: Fonts don't look right
**Solution:**
1. Verify fonts exist in `assets/fonts/`:
   - Poppins-Regular.ttf
   - Poppins-Bold.ttf
   - Poppins-SemiBold.ttf
2. Check file permissions
3. Restart the service

### Issue: Logo not appearing
**Solution:**
1. Check `assets/images/Logo.png` exists
2. Verify it's a valid PNG file (300×100px recommended)
3. Check file path in `pdf.config.js`

### Issue: "Cannot find module" error
**Solution:**
```bash
cd backend/booking-service
npm install
```

---

## Testing with Real Bookings (After API Integration)

Once your booking API is ready:

1. **Create a test booking** with status `CONFIRMED`

2. **Get the booking ID** from the database

3. **Call the real PDF endpoint:**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        -o itinerary.pdf \
        http://localhost:5000/api/v1/bookings/{BOOKING_ID}/pdf
   ```

4. **Or use the MyBookingsPage UI:**
   - Login to the application
   - Navigate to "My Bookings"
   - Click "Download PDF" button on a confirmed booking

---

## Customization

### Modify Mock Data
Edit `backend/booking-service/src/services/mockData.js` to change:
- Booking details
- Package information
- Traveler names
- Pricing amounts
- Itinerary days

### Update Branding
Edit `backend/booking-service/src/config/pdf.config.js` to change:
- Colors
- Fonts
- Company information
- Policies

### Customize Sections
Edit individual section files in:
```
backend/booking-service/src/services/pdf/templates/sections/
├── coverPage.js
├── bookingInfo.js
├── itinerary.js
├── pricing.js
└── policies.js
```

---

## Performance Notes

- **PDF Generation Time:** ~2-3 seconds
- **File Size:** ~500KB - 2MB (depends on images)
- **Concurrent Requests:** Tested up to 10 simultaneous PDF generations

---

## Next Steps

1. ✅ Test PDF with mock data (this guide)
2. ⏳ Connect to real booking API
3. ⏳ Test with production bookings
4. ⏳ Add rate limiting (5 PDFs/minute per user)
5. ⏳ Set up email delivery of PDFs
6. ⏳ Add QR code for booking verification

---

## Support

For issues or questions:
- **Email:** hello@tripandevent.com
- **Phone:** +91 900 700 0777
- **Website:** www.tripandevent.com

---

**Generated:** January 2026
**Version:** 1.0
**Status:** ✅ Ready for Preview
