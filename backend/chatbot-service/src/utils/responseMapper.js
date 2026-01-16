/**
 * Response mapper for chatbot - formats responses for frontend
 *
 * Provides MakeMyTrip-style friendly responses:
 * - One question at a time
 * - Quick reply buttons for guided flow
 * - Never exposes technical errors
 * - Same experience for guest and logged-in users
 */

const ACTION_TYPES = {
  SHOW_MESSAGE: 'show_message',
  SHOW_PACKAGES: 'show_packages',
  SHOW_DESTINATIONS: 'show_destinations',
  SHOW_PACKAGE_DETAILS: 'show_package_details',
  REQUEST_INPUT: 'request_user_input',
  CONFIRM_BOOKING: 'confirm_booking',
  BOOKING_INITIATED: 'booking_initiated',
  LEAD_CAPTURED: 'lead_captured',
  CALLBACK_REQUESTED: 'callback_requested',
  MODIFY_PREFERENCE: 'modify_preference',
  ERROR: 'error'
};

// User-friendly error messages (never expose technical details)
const USER_FRIENDLY_ERRORS = {
  PROCESSING_ERROR: "I didn't quite catch that. Could you try saying it differently?",
  SERVICE_UNAVAILABLE: "I'm having a moment! Please try again.",
  CRM_SERVICE_UNAVAILABLE: "Let me show you our featured options!",
  PACKAGE_NOT_FOUND: "I couldn't find that package. Let me show you similar ones.",
  AVAILABILITY_CHECK_FAILED: "I couldn't check availability right now. A travel expert can help!",
  SESSION_ERROR: "Let's start fresh! Where would you like to travel?",
  INVALID_INPUT: "Hmm, I didn't understand that. Could you rephrase?",
  DEFAULT: "Something went wrong. Let me try a different approach."
};

// Small talk responses - friendly but redirect to travel
const SMALL_TALK_RESPONSES = {
  how_are_you: [
    "I'm doing great, thank you for asking! 😊 Ready to help you plan an amazing trip.",
    "I'm wonderful, thanks! So, are you thinking about a getaway?",
    "Doing well! I'm excited to help you discover some fantastic travel destinations."
  ],
  thank_you: [
    "You're welcome! Happy to help. 🙏",
    "My pleasure! Is there anything else you'd like to explore?",
    "Glad I could help! Let me know if you need anything else."
  ],
  welcome: [
    "Thank you! Now, shall we find you an amazing trip?",
    "Thanks! Ready to explore some destinations?"
  ],
  goodbye: [
    "Goodbye! Have a wonderful day. Come back anytime you're ready to plan your next adventure! 👋",
    "Take care! Your trip details are saved if you want to continue later. 🌟",
    "See you soon! Safe travels! ✈️"
  ],
  sorry: [
    "No worries at all! How can I help you with your travel plans?",
    "That's perfectly fine! Let's get back to finding you a great trip."
  ],
  compliment: [
    "Thank you so much! That means a lot. 😊 Now, let's make your trip even better!",
    "You're too kind! I'm here to help you plan the perfect getaway."
  ],
  what_can_you_do: [
    "I'm your travel assistant! I can help you:\n\n✈️ **Discover destinations** - Tell me where you want to go\n📦 **Find packages** - I'll show you the best deals\n💰 **Match your budget** - Just tell me your range\n📅 **Plan dates** - Let me know when you're traveling\n👥 **Group trips** - Family, honeymoon, friends - I've got you covered\n\n**Where would you like to start?**"
  ],
  acknowledgment: [
    "Got it!",
    "Alright!",
    "Understood!"
  ]
};

/**
 * Get random response from array
 */
function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate small talk response with context-aware follow-up
 * Limit small talk to 1-2 turns, then guide back to travel
 */
function smallTalkResponse(subtype, context = null) {
  const responses = SMALL_TALK_RESPONSES[subtype] || SMALL_TALK_RESPONSES.acknowledgment;
  let message = getRandomResponse(responses);

  // For acknowledgments, add next step prompt based on context
  if (subtype === 'acknowledgment') {
    const nextStep = getNextStepFromContext(context);
    if (nextStep) {
      message = `${message} ${nextStep.prompt}`;
      return incompleteResponse(message, [nextStep.field], context);
    }
  }

  // For goodbye, don't add travel prompts
  if (subtype === 'goodbye') {
    return successResponse(
      ACTION_TYPES.SHOW_MESSAGE,
      message,
      { suggestions: [], quick_replies: [] },
      context
    );
  }

  // For other small talk, add gentle travel redirect
  const quickReplies = QUICK_REPLIES.general;

  return successResponse(
    ACTION_TYPES.SHOW_MESSAGE,
    message,
    {
      suggestions: quickReplies.map(r => r.text),
      quick_replies: quickReplies
    },
    context,
    subtype === 'what_can_you_do' ? null : "What would you like to explore?"
  );
}

/**
 * Get next step prompt based on current context
 */
function getNextStepFromContext(context) {
  if (!context) return { field: 'destination', prompt: getFieldPrompt('destination') };

  if (!context.destination) {
    return { field: 'destination', prompt: getFieldPrompt('destination') };
  }
  if (context.selectedPackageId && !context.travelDate) {
    return { field: 'travel_date', prompt: getFieldPrompt('travel_date') };
  }
  if (context.selectedPackageId && context.travelDate && !context.travelers) {
    return { field: 'travelers', prompt: getFieldPrompt('travelers') };
  }
  if (!context.selectedPackageId && context.destination) {
    return { field: 'package_selection', prompt: "Which package would you like to choose?" };
  }

  return null;
}

/**
 * Generate affirmation response based on context
 */
function affirmationResponse(context) {
  // Determine what the user is confirming based on current step
  const step = context?.currentStep;

  switch (step) {
    case 'AWAITING_CONFIRMATION':
      return successResponse(
        ACTION_TYPES.SHOW_MESSAGE,
        "Great! Let me proceed with that.",
        { confirmed: true },
        context
      );
    default:
      // Generic acknowledgment, prompt next step
      const nextStep = getNextStepFromContext(context);
      if (nextStep) {
        return incompleteResponse(
          `Perfect! ${nextStep.prompt}`,
          [nextStep.field],
          context
        );
      }
      return successResponse(
        ACTION_TYPES.SHOW_MESSAGE,
        "Great! How can I help you with your travel plans?",
        { suggestions: QUICK_REPLIES.general.map(r => r.text), quick_replies: QUICK_REPLIES.general },
        context
      );
  }
}

/**
 * Generate negation response based on context
 */
function negationResponse(context) {
  const step = context?.currentStep;

  // If user says no during confirmation, offer alternatives
  if (step === 'AWAITING_CONFIRMATION' || step === 'CONFIRMING_BOOKING') {
    return successResponse(
      ACTION_TYPES.SHOW_MESSAGE,
      "No problem! What would you like to change?",
      {
        suggestions: ['Change destination', 'Change date', 'Different package', 'Start over'],
        quick_replies: [
          { text: 'Change destination', value: 'I want a different destination' },
          { text: 'Change date', value: 'I want different travel dates' },
          { text: 'Different package', value: 'Show me other packages' },
          { text: 'Start over', value: 'Start fresh' }
        ]
      },
      context
    );
  }

  // Generic response
  return successResponse(
    ACTION_TYPES.SHOW_MESSAGE,
    "Alright, no problem. What would you prefer instead?",
    { suggestions: QUICK_REPLIES.general.map(r => r.text), quick_replies: QUICK_REPLIES.general },
    context
  );
}

// Quick reply suggestions for each step (MakeMyTrip style)
const QUICK_REPLIES = {
  destination: [
    { text: 'Beach destinations', value: 'Show me beach destinations' },
    { text: 'Hill stations', value: 'Show me hill stations' },
    { text: 'Heritage sites', value: 'Show me heritage destinations' },
    { text: 'Adventure spots', value: 'Adventure destinations' }
  ],
  trip_type: [
    { text: 'Family vacation', value: 'family trip' },
    { text: 'Honeymoon', value: 'honeymoon' },
    { text: 'Friends trip', value: 'friends group trip' },
    { text: 'Solo adventure', value: 'solo trip' }
  ],
  travelers: [
    { text: '2 adults', value: '2 adults' },
    { text: '2 adults 1 child', value: '2 adults 1 child' },
    { text: '4 travelers', value: '4 travelers' },
    { text: 'Just me', value: '1 traveler' }
  ],
  budget: [
    { text: 'Under ₹15,000', value: 'budget under 15000' },
    { text: '₹15,000 - ₹30,000', value: 'budget 15000 to 30000' },
    { text: '₹30,000 - ₹50,000', value: 'budget 30000 to 50000' },
    { text: 'Above ₹50,000', value: 'budget above 50000' }
  ],
  travel_date: [
    { text: 'This month', value: 'this month' },
    { text: 'Next month', value: 'next month' },
    { text: 'In 2-3 months', value: 'in 2 months' },
    { text: 'Flexible dates', value: 'flexible dates' }
  ],
  booking_confirm: [
    { text: 'Yes, proceed', value: 'Yes, I want to book' },
    { text: 'Change package', value: 'Show me other packages' },
    { text: 'Modify details', value: 'I want to change something' }
  ],
  name: [
    { text: 'Talk to expert', value: 'I want to talk to an expert' },
    { text: 'Start over', value: 'Start fresh' }
  ],
  email: [
    { text: 'Talk to expert', value: 'I want to talk to an expert' },
    { text: 'Start over', value: 'Start fresh' }
  ],
  phone: [
    { text: 'Talk to expert', value: 'I want to talk to an expert' },
    { text: 'Skip for now', value: 'Skip phone number' }
  ],
  general: [
    { text: 'Show destinations', value: 'Show me destinations' },
    { text: 'Popular packages', value: 'Show me popular packages' },
    { text: 'Talk to expert', value: 'I want to talk to an expert' }
  ]
};

/**
 * Format success response
 */
function successResponse(action, message, data = null, context = null, nextPrompt = null) {
  const response = {
    status: 'success',
    action,
    message,
    timestamp: new Date().toISOString()
  };

  if (data) {
    response.data = data;
  }

  if (context) {
    response.context = context;
  }

  if (nextPrompt) {
    response.next_prompt = nextPrompt;
  }

  return response;
}

/**
 * Format incomplete response (missing data) with quick replies
 */
function incompleteResponse(message, missingFields, context = null, quickReplies = null) {
  // Auto-generate quick replies based on first missing field
  const firstMissing = missingFields[0];
  const replies = quickReplies || QUICK_REPLIES[firstMissing] || QUICK_REPLIES.general;

  return {
    status: 'incomplete',
    action: ACTION_TYPES.REQUEST_INPUT,
    message,
    missing_fields: missingFields,
    data: {
      suggestions: replies.map(r => r.text),
      quick_replies: replies
    },
    context,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format error response - NEVER expose technical details
 */
function errorResponse(code, customMessage = null, retry = true) {
  const message = customMessage || USER_FRIENDLY_ERRORS[code] || USER_FRIENDLY_ERRORS.DEFAULT;

  return {
    status: 'error',
    action: ACTION_TYPES.ERROR,
    code: 'TEMPORARY_ISSUE',
    message,
    data: {
      suggestions: ['Try again', 'Show me packages', 'Talk to an expert'],
      quick_replies: [
        { text: 'Try again', value: 'Let me try again' },
        { text: 'Show packages', value: 'Show me packages' },
        { text: 'Talk to expert', value: 'I want to talk to an expert' }
      ]
    },
    retry,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format package for display
 */
function formatPackage(pkg) {
  return {
    package_id: pkg.packageId || pkg.package_id,
    title: pkg.title,
    destination: typeof pkg.destination === 'string' ? pkg.destination : (pkg.destination?.name || ''),
    duration: pkg.duration,
    price: parseFloat(pkg.price),
    discount_price: pkg.discountPrice ? parseFloat(pkg.discountPrice) : (pkg.discount_price ? parseFloat(pkg.discount_price) : null),
    highlights: pkg.highlights || [],
    image_url: pkg.imageUrl || pkg.image_url,
    rating: pkg.rating || 4.5,
    review_count: pkg.reviewCount || pkg.review_count || 0,
    trip_type: pkg.tripType || pkg.trip_type || 'leisure',
    featured: pkg.featured || false
  };
}

/**
 * Format destination for display
 */
function formatDestination(dest) {
  return {
    id: dest.id,
    name: dest.name,
    slug: dest.slug,
    country: dest.country,
    state: dest.state,
    description: dest.description,
    image_url: dest.imageUrl || dest.image_url,
    highlights: dest.highlights || [],
    best_time: dest.bestTime || dest.best_time,
    package_count: dest.packageCount || dest.package_count || dest._count?.packages || 0
  };
}

/**
 * Format package details for display
 */
function formatPackageDetails(pkg) {
  return {
    ...formatPackage(pkg),
    description: pkg.description,
    inclusions: pkg.inclusions || [],
    exclusions: pkg.exclusions || [],
    itinerary: pkg.itinerary || [],
    min_travelers: pkg.minTravelers || pkg.min_travelers || 1,
    max_travelers: pkg.maxTravelers || pkg.max_travelers || 10,
    availability: pkg.availability || 'available'
  };
}

/**
 * Generate greeting message - MakeMyTrip style with quick replies
 */
function greetingMessage() {
  return successResponse(
    ACTION_TYPES.SHOW_MESSAGE,
    `Hi there! 👋 I'm your Trip & Event travel assistant.\n\nI can help you:\n✈️ Discover amazing travel packages\n🏖️ Find the perfect destination\n📅 Plan your dream trip\n\n**Where would you like to go?**`,
    {
      suggestions: ['Beach destinations', 'Hill stations', 'Family packages', 'Popular destinations'],
      quick_replies: [
        { text: 'Beach destinations', value: 'Show me beach destinations' },
        { text: 'Hill stations', value: 'Show me hill station packages' },
        { text: 'Family packages', value: 'Show me family trip packages' },
        { text: 'View all destinations', value: 'Show me all destinations' }
      ]
    },
    null,
    "Where would you like to go?"
  );
}

/**
 * Generate packages response with selection quick replies
 */
function packagesResponse(packages, context, message = null) {
  const formattedPackages = packages.map(formatPackage);
  const displayMessage = message || `Great! I found **${packages.length} package${packages.length !== 1 ? 's'  : ''}** for you:\n\n_Tap any package to see details, or tell me your preference._`;

  // Generate quick replies for package selection
  const packageQuickReplies = formattedPackages.slice(0, 3).map((pkg, index) => ({
    text: `${index + 1}. ${pkg.title.substring(0, 20)}...`,
    value: `Tell me about ${pkg.title}`
  }));
  packageQuickReplies.push({ text: 'Show more options', value: 'Show me more packages' });

  return successResponse(
    ACTION_TYPES.SHOW_PACKAGES,
    displayMessage,
    {
      packages: formattedPackages,
      source: 'demo_data',
      suggestions: packageQuickReplies.map(r => r.text),
      quick_replies: packageQuickReplies
    },
    context,
    "Which package interests you?"
  );
}

/**
 * Generate destinations response with quick replies
 */
function destinationsResponse(destinations, message = null) {
  const formattedDestinations = destinations.map(formatDestination);
  const displayMessage = message || "Here are our **popular destinations**:\n\n_Tap any destination to see packages._";

  const destQuickReplies = formattedDestinations.slice(0, 4).map(dest => ({
    text: dest.name,
    value: `Show me packages for ${dest.name}`
  }));

  return successResponse(
    ACTION_TYPES.SHOW_DESTINATIONS,
    displayMessage,
    {
      destinations: formattedDestinations,
      source: 'demo_data',
      suggestions: destQuickReplies.map(r => r.text),
      quick_replies: destQuickReplies
    },
    null,
    "Which destination would you like to explore?"
  );
}

/**
 * Generate package details response with booking quick replies
 */
function packageDetailsResponse(pkg, context) {
  const formatted = formatPackageDetails(pkg);
  const price = formatted.discount_price || formatted.price;

  return successResponse(
    ACTION_TYPES.SHOW_PACKAGE_DETAILS,
    `Here's **${pkg.title}**:\n\n📍 ${formatted.destination}\n⏱️ ${formatted.duration}\n💰 Starting from ₹${price.toLocaleString('en-IN')}/person\n⭐ ${formatted.rating}/5 rating\n\n**Ready to book this package?**`,
    {
      package: formatted,
      source: 'demo_data',
      suggestions: ['Book this package', 'Show similar packages', 'Change destination'],
      quick_replies: [
        { text: 'Book this package', value: `I want to book ${pkg.title}` },
        { text: 'See similar', value: 'Show similar packages' },
        { text: 'Different destination', value: 'Show me other destinations' }
      ]
    },
    context,
    "Would you like to book this package?"
  );
}

/**
 * Generate question prompts based on missing field - ONE question at a time (MakeMyTrip style)
 */
function getFieldPrompt(field) {
  const prompts = {
    destination: "**Where would you like to go?**\n\nTell me a destination, or choose from popular options below.",
    travel_date: "**When are you planning to travel?**\n\nYou can say things like 'next month' or '15th March'.",
    travelers: "**How many travelers?**\n\nInclude adults and children if any.",
    trip_type: "**What type of trip are you planning?**\n\nThis helps me find the best packages for you.",
    budget: "**What's your budget per person?**\n\nThis helps me filter the best options for you.",
    package_selection: "**Which package would you like?**\n\nYou can tap any package or tell me the name.",
    name: "**What's your name?**\n\nI'll use this for the booking.",
    email: "**What's your email address?**\n\nWe'll send the booking confirmation here.",
    phone: "**What's your phone number?**\n\nOur travel expert may need to contact you."
  };

  return prompts[field] || "Please provide more details.";
}

/**
 * Get quick replies for a specific field
 */
function getQuickRepliesForField(field) {
  return QUICK_REPLIES[field] || QUICK_REPLIES.general;
}

/**
 * Generate context summary for user (show current selections)
 */
function summarizeContext(context) {
  const parts = [];

  if (context.destination) parts.push(`📍 ${context.destination}`);
  if (context.travelDate) parts.push(`📅 ${context.travelDate}`);
  if (context.travelers) {
    const t = context.travelers;
    const count = t.total || t.adults || t;
    parts.push(`👥 ${count} traveler${count > 1 ? 's' : ''}`);
  }
  if (context.tripType) parts.push(`🎯 ${context.tripType}`);
  if (context.selectedPackage) parts.push(`📦 ${context.selectedPackage.title}`);
  if (context.budget?.max) parts.push(`💰 Under ₹${context.budget.max.toLocaleString('en-IN')}`);

  return parts.length > 0 ? `\n\n**Your trip so far:**\n${parts.join(' | ')}` : '';
}

/**
 * Generate preference modification prompt
 */
function modifyPreferencePrompt(context) {
  const modifiable = [];

  if (context.destination) modifiable.push({ text: `Change destination (${context.destination})`, value: 'Change destination' });
  if (context.travelDate) modifiable.push({ text: `Change date (${context.travelDate})`, value: 'Change travel date' });
  if (context.travelers) modifiable.push({ text: `Change travelers`, value: 'Change number of travelers' });
  if (context.selectedPackage) modifiable.push({ text: `Change package`, value: 'Show me different packages' });

  modifiable.push({ text: 'Start over', value: 'Start fresh' });

  return successResponse(
    ACTION_TYPES.MODIFY_PREFERENCE,
    `**What would you like to change?**${summarizeContext(context)}`,
    {
      suggestions: modifiable.map(m => m.text),
      quick_replies: modifiable
    },
    context
  );
}

/**
 * Generate contact collection prompts (for booking intent)
 */
function contactPrompt(field, context, isGuest = true) {
  const prompts = {
    name: {
      message: "**Great choice!** To proceed with your booking, may I have your name?",
      suggestions: []
    },
    email: {
      message: `Thanks${context.contact?.name ? `, ${context.contact.name}` : ''}! **What's your email address?**\n\nWe'll send the booking details here.`,
      suggestions: []
    },
    phone: {
      message: "**What's your phone number?**\n\nOur travel expert will contact you to finalize the booking.",
      suggestions: [
        { text: 'Call me instead', value: 'I want a callback' }
      ]
    }
  };

  const prompt = prompts[field] || prompts.name;

  return incompleteResponse(
    prompt.message + summarizeContext(context),
    [field],
    context,
    prompt.suggestions.length > 0 ? prompt.suggestions : null
  );
}

/**
 * Generate booking confirmation message (travel expert callback)
 */
function bookingConfirmation(context) {
  const pkg = context.selectedPackage;
  const travelers = context.travelers?.total || context.travelers || 2;
  const price = pkg.discountPrice || pkg.price;
  const total = parseFloat(price) * travelers;

  return successResponse(
    ACTION_TYPES.CONFIRM_BOOKING,
    `**🎉 Booking Request Received!**\n\nHere's your trip summary:\n\n📦 **${pkg.title}**\n📍 ${context.destination}\n📅 ${context.travelDate}\n👥 ${travelers} traveler${travelers > 1 ? 's' : ''}\n💰 **Estimated: ₹${total.toLocaleString('en-IN')}**\n\n**Your Details:**\n👤 ${context.contact.name}\n📧 ${context.contact.email}\n📱 ${context.contact.phone}\n\n---\n\n✨ **What happens next?**\nOur travel expert will call you within **24 hours** to:\n• Confirm availability & final pricing\n• Customize your itinerary\n• Complete your booking\n\nThank you for choosing Trip & Event!`,
    {
      booking: {
        packageId: pkg.packageId,
        packageTitle: pkg.title,
        destination: context.destination,
        travelDate: context.travelDate,
        travelers: context.travelers,
        pricePerPerson: parseFloat(price),
        totalPrice: total,
        contact: context.contact
      },
      payment_required: false,
      expert_callback: true,
      status: 'pending_expert_contact',
      suggestions: ['Explore more destinations', 'Book another trip'],
      quick_replies: [
        { text: 'Explore more', value: 'Show me more destinations' },
        { text: 'Book another', value: 'I want to book another trip' }
      ]
    },
    context,
    "Is there anything else I can help you with?"
  );
}

module.exports = {
  ACTION_TYPES,
  QUICK_REPLIES,
  successResponse,
  incompleteResponse,
  errorResponse,
  formatPackage,
  formatDestination,
  formatPackageDetails,
  greetingMessage,
  packagesResponse,
  destinationsResponse,
  packageDetailsResponse,
  getFieldPrompt,
  getQuickRepliesForField,
  summarizeContext,
  modifyPreferencePrompt,
  contactPrompt,
  bookingConfirmation,
  // Small talk & casual conversation
  smallTalkResponse,
  affirmationResponse,
  negationResponse,
  getNextStepFromContext
};
