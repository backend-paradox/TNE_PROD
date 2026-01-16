/**
 * Test Script for PDF with Visa Section
 * Tests the grid rendering bug fix in visaInfo.js
 */

const fs = require('fs');
const path = require('path');
const PDFGenerator = require('./src/services/pdf/pdfGenerator');

// Mock booking data
const testBooking = {
  bookingNumber: 'TNE2026001235',
  createdAt: new Date(),
  totalAmount: 185000,
  tcsAmount: 9250,
  tcsPercentage: 5,
  paymentLink: 'https://pay.tripandevent.com/booking/TNE2026001235',
  status: 'PENDING',
  travelers: [
    { name: 'Amit Sharma', email: 'amit@example.com', phone: '+91 98765 43210' }
  ],
  curator: {
    name: 'Priya Mehta',
    title: 'International Travel Specialist',
    message: 'Looking forward to helping you plan this amazing international adventure!',
    phone: '+91 11 4567 8900',
    email: 'priya.mehta@tripandevent.com',
    availability: 'Mon-Sat, 9 AM - 6 PM'
  }
};

// Mock package with VISA requirements
const testPackage = {
  name: 'European Adventure - Paris, Rome & Barcelona',
  tagline: 'Discover the Best of Europe',
  description: 'Experience the magic of Europe with our curated 10-day package covering the romantic streets of Paris, ancient wonders of Rome, and vibrant culture of Barcelona.',
  duration: '9 Nights / 10 Days',
  destination: 'Europe (France, Italy, Spain)',
  startDate: new Date('2026-06-15'),
  endDate: new Date('2026-06-24'),
  highlights: [
    { title: 'Eiffel Tower Visit', description: 'Skip-the-line tickets to Paris icon', icon: '🗼' },
    { title: 'Vatican Museum', description: 'Guided tour of Sistine Chapel', icon: '🏛️' },
    { title: 'Sagrada Familia', description: "Gaudi's masterpiece in Barcelona", icon: '⛪' },
    { title: 'Seine River Cruise', description: 'Evening dinner cruise in Paris', icon: '🚢' }
  ],
  importantInfo: 'Schengen visa required for Indian passport holders. Apply at least 15 days before departure. Travel insurance mandatory for Schengen countries.',
  itinerary: [
    {
      day: 1,
      title: 'Arrival in Paris',
      date: '2026-06-15',
      activities: [
        { time: '2:00 PM', title: 'Airport Pickup', description: 'CDG Airport transfer', icon: '✈️' },
        { time: '4:00 PM', title: 'Hotel Check-in', description: 'Rest and freshen up', icon: '🏨' }
      ],
      meals: [
        { type: 'Dinner', included: true, venue: 'Hotel Restaurant' }
      ],
      transfers: [
        { type: 'Airport Transfer', route: 'CDG → Hotel', duration: '1 hour', vehicle: 'Private AC Car' }
      ],
      accommodation: 'Novotel Paris Centre (4-star)'
    }
  ],
  inclusions: [
    '9 nights accommodation in 4-star hotels',
    'Daily breakfast and select meals',
    'All inter-city transfers (Paris-Rome-Barcelona)',
    'Schengen visa assistance',
    'Travel insurance',
    'All sightseeing with skip-the-line tickets',
    'Professional English-speaking guides',
    'Airport transfers'
  ],
  exclusions: [
    'International airfare',
    'Visa fees (approx ₹8,000)',
    'Personal expenses',
    'Meals not mentioned',
    'Optional activities',
    'Travel insurance (included but can be upgraded)'
  ],
  visaRequired: true,
  visaInfo: {
    type: 'Schengen Tourist Visa (Type C)',
    duration: '90 Days (within 180-day period)',
    processingTime: '10-15 Working Days',
    process: 'Online/VFS Global',
    requirements: [
      'Valid Passport (6+ months validity)',
      'Completed Visa Application Form',
      'Recent Passport-sized Photographs (2 nos)',
      'Flight Itinerary (Round-trip booking)',
      'Hotel Reservations (All nights)',
      'Travel Insurance (30,000 EUR coverage)',
      'Bank Statements (Last 6 months)',
      'Income Tax Returns (Last 3 years)'
    ],
    notes: [
      'Schengen visa allows travel to 27 European countries.',
      'Processing time may extend during peak season (April-September).',
      'Trip & Event provides complete visa assistance including document review and appointment booking.',
      'Visa fees are non-refundable even if visa is rejected.'
    ]
  },
  cancellationTimeline: [
    { period: 'More than 45 days', refund: '100% refund' },
    { period: '30-45 days', refund: '75% refund' },
    { period: '15-30 days', refund: '50% refund' },
    { period: 'Less than 15 days', refund: 'No refund' }
  ]
};

const testUser = {
  name: 'Amit Sharma',
  email: 'amit@example.com',
  phone: '+91 98765 43210'
};

async function runTest() {
  try {
    console.log('===========================================');
    console.log('PDF Test with Visa Section (Grid Bug Fix)');
    console.log('===========================================\n');
    console.log('Testing:');
    console.log('✓ Visa section rendering');
    console.log('✓ 2-column document grid (8 requirements = 4 rows)');
    console.log('✓ No text overlaps in grid');
    console.log('✓ Proper Y-position tracking\n');
    console.log('Generating PDF...\n');

    const generator = new PDFGenerator();
    const pdfBuffer = await generator.generateItinerary({
      booking: testBooking,
      package: testPackage,
      user: testUser
    });

    const outputPath = path.join(__dirname, 'test-output-with-visa.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log('✓ PDF generated successfully!');
    console.log(`✓ Saved to: ${outputPath}`);
    console.log(`✓ File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB\n`);
    console.log('===========================================');
    console.log('Test completed!');
    console.log('===========================================');
    console.log('\nPlease verify:');
    console.log('1. Visa section appears after "How to Book"');
    console.log('2. 8 documents in 2-column grid (4 rows)');
    console.log('3. No overlapping text in document grid');
    console.log('4. All sections flow continuously\n');
  } catch (error) {
    console.error('✗ Test failed:');
    console.error(error.message);
    console.error('\nStack:');
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();
