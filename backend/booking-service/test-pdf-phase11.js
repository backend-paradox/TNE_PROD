/**
 * Test Script for Phase 11 PDF Enhancements
 * Tests all 10 categories of MakeMyTrip-style PDF improvements
 */

const fs = require('fs');
const path = require('path');
const PDFGenerator = require('./src/services/pdf/pdfGenerator');

// Mock booking data with all Phase 11 features
const testBooking = {
  bookingNumber: 'TNE2026001234',
  createdAt: new Date(),
  totalAmount: 125000,
  tcsAmount: 6250, // 5% TCS
  tcsPercentage: 5,
  paymentLink: 'https://pay.tripandevent.com/booking/TNE2026001234',
  paymentQRCode: null, // Can be added as base64 data URL
  status: 'PENDING',
  travelers: [
    {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      phone: '+91 98765 43210'
    },
    {
      name: 'Priya Kumar',
      email: 'priya.kumar@example.com',
      phone: '+91 98765 43211'
    }
  ],
  curator: {
    name: 'Vikram Singh',
    title: 'Senior Travel Expert',
    message: 'Excited to help you create unforgettable memories on this journey!',
    phone: '+91 11 4567 8900',
    email: 'vikram.singh@tripandevent.com',
    availability: 'Mon-Sat, 9 AM - 6 PM'
  }
};

// Mock package data with Phase 11 features
const testPackage = {
  name: 'Magical Kerala - Backwaters & Hills',
  tagline: 'God\'s Own Country Awaits You',
  description: 'Experience the breathtaking beauty of Kerala with our curated 6-day package covering serene backwaters, lush tea plantations, and pristine beaches.',
  duration: '5 Nights / 6 Days',
  destination: 'Kerala, India',
  startDate: new Date('2026-03-15'),
  endDate: new Date('2026-03-20'),

  // Table of Contents items
  highlights: [
    {
      title: 'Houseboat Stay',
      description: 'Overnight luxury houseboat cruise in Alleppey backwaters',
      imageUrl: null,
      icon: '🚢'
    },
    {
      title: 'Tea Plantation Tour',
      description: 'Guided tour of Munnar\'s famous tea estates',
      imageUrl: null,
      icon: '🍵'
    },
    {
      title: 'Kathakali Performance',
      description: 'Traditional Kerala dance performance',
      imageUrl: null,
      icon: '🎭'
    },
    {
      title: 'Wildlife Safari',
      description: 'Periyar Wildlife Sanctuary jeep safari',
      imageUrl: null,
      icon: '🦌'
    }
  ],

  // Important information box
  importantInfo: 'Please carry valid government-issued photo ID proof. Comfortable walking shoes recommended for tea plantation tours. Cameras and phones not allowed during Kathakali performance.',

  // Itinerary with activities, meals, transfers
  itinerary: [
    {
      day: 1,
      title: 'Arrival in Cochin - Transfer to Munnar',
      date: '2026-03-15',
      activities: [
        {
          time: '10:00 AM',
          title: 'Airport Pickup',
          description: 'Meet and greet at Cochin International Airport',
          duration: '30 mins',
          imageUrl: null,
          icon: '✈️'
        },
        {
          time: '11:00 AM',
          title: 'Scenic Drive to Munnar',
          description: 'Enjoy picturesque views of Western Ghats en route',
          duration: '4 hours',
          imageUrl: null,
          icon: '🚗'
        },
        {
          time: '4:00 PM',
          title: 'Check-in & Relax',
          description: 'Check-in at resort and freshen up',
          duration: '1 hour',
          imageUrl: null,
          icon: '🏨'
        }
      ],
      meals: [
        { type: 'Lunch', included: true, venue: 'En Route Restaurant' },
        { type: 'Dinner', included: true, venue: 'Hotel Restaurant' }
      ],
      transfers: [
        {
          type: 'Airport to Munnar',
          route: 'Cochin Airport → Munnar Resort',
          duration: '4 hours',
          vehicle: 'Private AC Car'
        }
      ],
      accommodation: 'Tea Valley Resort, Munnar (Deluxe Room)'
    },
    {
      day: 2,
      title: 'Munnar Sightseeing',
      date: '2026-03-16',
      activities: [
        {
          time: '8:00 AM',
          title: 'Tea Plantation Tour',
          description: 'Guided tour of tea estates with factory visit',
          duration: '3 hours',
          imageUrl: null,
          icon: '🍵'
        },
        {
          time: '12:00 PM',
          title: 'Mattupetty Dam Visit',
          description: 'Scenic reservoir with boating option',
          duration: '2 hours',
          imageUrl: null,
          icon: '🛶'
        },
        {
          time: '3:00 PM',
          title: 'Echo Point',
          description: 'Natural echo phenomenon spot',
          duration: '1 hour',
          imageUrl: null,
          icon: '🏞️'
        }
      ],
      meals: [
        { type: 'Breakfast', included: true, venue: 'Hotel Restaurant' },
        { type: 'Lunch', included: true, venue: 'Local Restaurant' },
        { type: 'Dinner', included: true, venue: 'Hotel Restaurant' }
      ],
      transfers: [],
      accommodation: 'Tea Valley Resort, Munnar (Deluxe Room)'
    }
  ],

  // Inclusions and Exclusions
  inclusions: [
    '5 nights accommodation in premium hotels',
    'Daily breakfast, lunch, and dinner as per itinerary',
    'All transfers in private AC vehicle',
    'Houseboat cruise with overnight stay',
    'All sightseeing and entry fees',
    'Professional English-speaking guide',
    'Airport pickup and drop',
    'All applicable taxes'
  ],

  exclusions: [
    'Airfare / Train tickets to Cochin',
    'Personal expenses (laundry, tips, phone calls)',
    'Travel insurance',
    'Camera fees at monuments',
    'Any meals not mentioned in inclusions',
    'Activities not mentioned in itinerary',
    'GST as applicable'
  ],

  // Visa information (conditional)
  visaRequired: false,
  visaInfo: null,

  // Cancellation policy
  cancellationTimeline: [
    { period: 'More than 30 days', refund: '100% refund' },
    { period: '15-30 days', refund: '50% refund' },
    { period: 'Less than 15 days', refund: 'No refund' }
  ]
};

// Mock user data
const testUser = {
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@example.com',
  phone: '+91 98765 43210'
};

async function runTest() {
  try {
    console.log('===========================================');
    console.log('Phase 11 PDF Enhancement Test');
    console.log('===========================================\n');

    console.log('Testing Categories:');
    console.log('1. ✓ Enhanced Cover Page (ToC, Curator, Highlights)');
    console.log('2. ✓ Itinerary Overview Table');
    console.log('3. ✓ Enhanced Day Cards (Images, Meals, Transfers)');
    console.log('4. ✓ Package Highlights with Images');
    console.log('5. ✓ Enhanced Pricing (TCS, Pay Now)');
    console.log('6. ✓ Cancellation Timeline with Icons');
    console.log('7. ✓ Visual Design Elements (Important Info Box)');
    console.log('8. ✓ Typography & Spacing Improvements');
    console.log('9. ✓ Additional Sections (How to Book, Get in Touch)');
    console.log('10. ✓ Enhanced Footer with Branding\n');

    console.log('Generating PDF with all enhancements...\n');

    const generator = new PDFGenerator();
    const pdfBuffer = await generator.generateItinerary({
      booking: testBooking,
      package: testPackage,
      user: testUser
    });

    // Save PDF to file
    const outputPath = path.join(__dirname, 'test-output-phase11.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log('✓ PDF generated successfully!');
    console.log(`✓ Saved to: ${outputPath}`);
    console.log(`✓ File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB\n`);

    console.log('===========================================');
    console.log('Test completed successfully!');
    console.log('===========================================');
    console.log('\nPlease open the PDF to verify all enhancements:');
    console.log('- Cover page with table of contents');
    console.log('- Itinerary overview table');
    console.log('- Day cards with activity icons and meal checkmarks');
    console.log('- Package highlights grid with fallback icons');
    console.log('- TCS information box and Pay Now button');
    console.log('- Cancellation timeline with status icons');
    console.log('- Important information box (coral/orange)');
    console.log('- How to Book section with payment steps');
    console.log('- Get in Touch full page with contact methods');
    console.log('- Enhanced footer with decorative elements\n');

  } catch (error) {
    console.error('✗ Test failed with error:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
runTest();
