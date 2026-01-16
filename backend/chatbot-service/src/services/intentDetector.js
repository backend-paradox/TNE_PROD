const { getOpenAIClient, config: openaiConfig } = require('../config/openai');
const { INTENT_DETECTION_PROMPT } = require('../prompts/systemPrompt');

// Intent types
const INTENTS = {
  GREETING: 'greeting',
  SMALL_TALK: 'small_talk',  // Casual conversation (how are you, thank you, ok, hmm)
  GENERAL_CHAT: 'general_chat',  // General AI conversation (jokes, questions, etc.)
  SEARCH_DESTINATION: 'search_destination',
  SEARCH_PACKAGES: 'search_packages',
  GET_PACKAGE_DETAILS: 'get_package_details',
  SELECT_PACKAGE: 'select_package',
  PROVIDE_TRAVEL_DATE: 'provide_travel_date',
  PROVIDE_TRAVELERS: 'provide_travelers',
  PROVIDE_TRIP_TYPE: 'provide_trip_type',
  PROVIDE_BUDGET: 'provide_budget',
  PROVIDE_CONTACT: 'provide_contact',
  CHECK_AVAILABILITY: 'check_availability',
  INITIATE_BOOKING: 'initiate_booking',
  MODIFY_PREFERENCE: 'modify_preference',  // User wants to change something
  TALK_TO_EXPERT: 'talk_to_expert',  // User wants callback/expert
  AFFIRMATION: 'affirmation',  // Yes, ok, sure, correct
  NEGATION: 'negation',  // No, not really, wrong
  FAQ: 'faq',
  CANCEL: 'cancel',
  FALLBACK: 'fallback'
};

// Small talk patterns with subtypes
const SMALL_TALK_PATTERNS = {
  how_are_you: /^(how\s*(are|r)\s*(you|u|ya)|how('s|s)?\s*it\s*going|how\s*do\s*you\s*do|what('s|s)?\s*up|sup)/i,
  thank_you: /^(thank\s*(you|u|s)|thanks|thx|ty|appreciate\s*it|much\s*appreciated)/i,
  welcome: /^(you('re|r)?\s*welcome|no\s*problem|np|my\s*pleasure|anytime)/i,
  goodbye: /^(bye|goodbye|see\s*(you|ya)|take\s*care|later|gtg|gotta\s*go|cya)/i,
  sorry: /^(sorry|my\s*bad|apologies|oops|excuse\s*me)/i,
  compliment: /^(you('re|r)?\s*(great|awesome|helpful|amazing)|nice|cool|good\s*job|well\s*done)/i,
  what_can_you_do: /^(what\s*(can|do)\s*you\s*(do|help|offer)|help\s*me|what\s*are\s*your?\s*(features|capabilities))/i
};

// Affirmation and negation patterns
const AFFIRMATION_PATTERNS = /^(yes|yeah|yep|yup|sure|ok|okay|k|correct|right|exactly|perfect|absolutely|definitely|of\s*course|sounds\s*good|go\s*ahead|proceed|confirm)/i;
const NEGATION_PATTERNS = /^(no|nope|nah|not\s*really|wrong|incorrect|that('s|s)?\s*not\s*right|change\s*it|different)/i;

// Minimal acknowledgment patterns (should prompt next step)
const MINIMAL_ACK_PATTERNS = /^(ok|okay|k|hmm|hm|mm|ah|oh|i\s*see|alright|got\s*it|understood|fine)$/i;

// Keyword-based fallback patterns
const KEYWORD_PATTERNS = {
  [INTENTS.GREETING]: /^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|howdy)/i,
  [INTENTS.SEARCH_DESTINATION]: /(tell\s*me\s*about|what('s|\s*is)\s*(there\s*)?in|info\s*(on|about)|want\s*to\s*(go|visit|travel)\s*to|interested\s*in|i\s*want\s*to\s*(plan|go)\s*(a\s*)?(trip|vacation|holiday|tour)|plan\s*(a\s*)?(trip|vacation|holiday|tour)|let('s|s)?\s*(plan|go))/i,
  [INTENTS.SEARCH_PACKAGES]: /(show|list|what|any|get|find|see|browse)\s*(me\s*)?(more\s*)?(packages?|tours?|trips?|deals?|destinations?|popular|options?)|more\s+packages?|other\s+packages?|different\s+packages?/i,
  [INTENTS.GET_PACKAGE_DETAILS]: /(more\s*(about|details?|info)|tell\s*me\s*about\s*PKG|details?\s*(of|for|about))/i,
  [INTENTS.SELECT_PACKAGE]: /(select|choose|book|take|want)\s*(this|that|the|package|first|second|third|PKG)/i,
  [INTENTS.PROVIDE_TRAVEL_DATE]: /(travel|going|start|depart|leave)\s*(on|date|from)?.*(\d{1,2}|\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  [INTENTS.PROVIDE_TRAVELERS]: /(\d+)\s*(people|person|adults?|travelers?|travellers?|members?|pax)/i,
  [INTENTS.PROVIDE_TRIP_TYPE]: /(honeymoon|family|adventure|leisure|pilgrimage|solo|friends|romantic)/i,
  [INTENTS.PROVIDE_BUDGET]: /(budget|under|below|around|within|max|upto)\s*₹?\s*\d+\s*(k|thousand|lac|lakh)?$/i,
  [INTENTS.CHECK_AVAILABILITY]: /(available|availability|slots?|open|vacant)/i,
  [INTENTS.INITIATE_BOOKING]: /(book|confirm|proceed|finalize|reserve)/i,
  [INTENTS.MODIFY_PREFERENCE]: /(change|modify|update|different|another|other)\s*(destination|date|travelers?|package|budget)/i,
  [INTENTS.TALK_TO_EXPERT]: /(talk|speak|call)\s*(to|with)?\s*(expert|agent|human|someone|representative)|callback|call\s*me|connect\s*(me\s*)?(to|with)/i,
  [INTENTS.FAQ]: /(what('s|\s*is)\s*included|include[ds]?|exclude[ds]?|cancellation|refund|payment)/i,
  [INTENTS.CANCEL]: /(cancel|restart|start\s*over|reset|quit|start\s*fresh)/i
};

// Destination keywords for extraction
const DESTINATION_KEYWORDS = [
  'goa', 'manali', 'kerala', 'rajasthan', 'andaman', 'shimla',
  'jaipur', 'udaipur', 'jodhpur', 'jaisalmer', 'munnar', 'alleppey',
  'kovalam', 'ooty', 'kodaikanal', 'darjeeling', 'sikkim', 'ladakh',
  'rishikesh', 'haridwar', 'varanasi', 'agra', 'delhi', 'mumbai'
];

// Trip type keywords
const TRIP_TYPE_KEYWORDS = {
  honeymoon: ['honeymoon', 'romantic', 'couple', 'anniversary', 'newlywed'],
  family: ['family', 'kids', 'children', 'parents', 'relatives'],
  adventure: ['adventure', 'trekking', 'hiking', 'rafting', 'camping', 'sports'],
  leisure: ['leisure', 'relaxation', 'vacation', 'holiday', 'getaway', 'chill'],
  pilgrimage: ['pilgrimage', 'temple', 'religious', 'spiritual', 'darshan']
};

class IntentDetector {
  constructor() {
    this.openai = getOpenAIClient();
  }

  /**
   * Detect intent from user message
   * @param {string} message - User message
   * @param {object} context - Conversation context
   * @returns {Promise<{intent: string, confidence: number, entities: object}>}
   */
  async detectIntent(message, context = {}) {
    const lowerMessage = message.toLowerCase().trim();

    // PRIORITY 0: Check for high-priority escape intents that should ALWAYS work
    // These should work regardless of current step
    const escapeIntent = this.detectEscapeIntent(lowerMessage, context);
    if (escapeIntent) {
      console.log(`[IntentDetector] Escape intent detected: ${escapeIntent.intent}`);
      return {
        ...escapeIntent,
        entities: this.extractEntities(lowerMessage, context)
      };
    }

    // PRIORITY 1: Check for small talk FIRST - handle locally for speed
    // This prevents OpenAI from being called for simple casual chat
    const smallTalkResult = this.detectSmallTalk(lowerMessage, context);
    if (smallTalkResult) {
      console.log(`[IntentDetector] Small talk detected: ${smallTalkResult.subtype}`);
      return {
        ...smallTalkResult,
        entities: this.extractEntities(lowerMessage, context)
      };
    }

    // PRIORITY 2: Check for affirmation/negation - quick local handling
    if (AFFIRMATION_PATTERNS.test(lowerMessage)) {
      return {
        intent: INTENTS.AFFIRMATION,
        confidence: 0.9,
        entities: this.extractEntities(lowerMessage, context),
        subtype: 'yes'
      };
    }

    if (NEGATION_PATTERNS.test(lowerMessage)) {
      return {
        intent: INTENTS.NEGATION,
        confidence: 0.9,
        entities: this.extractEntities(lowerMessage, context),
        subtype: 'no'
      };
    }

    // PRIORITY 3: Try OpenAI for complex travel queries
    if (this.openai) {
      try {
        const result = await this.detectWithOpenAI(message, context);
        if (result && result.confidence > 0.7) {
          return result;
        }
      } catch (error) {
        console.error('OpenAI intent detection failed:', error.message);
      }
    }

    // PRIORITY 4: Fallback to keyword-based detection
    return this.detectWithKeywords(message, context);
  }

  /**
   * Detect escape intents that should work regardless of current step
   * These allow users to break out of any flow
   */
  detectEscapeIntent(message, context) {
    // Talk to expert - always allow
    if (/(talk|speak|call|connect)\s*(to|with)?\s*(expert|agent|human|someone|representative)|callback|call\s*me|i\s*want\s*(to\s*)?(talk|speak)/i.test(message)) {
      return {
        intent: INTENTS.TALK_TO_EXPERT,
        confidence: 0.95
      };
    }

    // Cancel/restart - always allow
    if (/(cancel|restart|start\s*over|reset|quit|start\s*fresh|begin\s*again)/i.test(message)) {
      return {
        intent: INTENTS.CANCEL,
        confidence: 0.95
      };
    }

    // Show packages/destinations - allow as navigation
    if (/(show|see|view|browse|get|find)\s*(me\s*)?(more\s*)?(packages?|destinations?|popular|options?)|more\s+packages?|other\s+packages?|different\s+packages?/i.test(message)) {
      return {
        intent: INTENTS.SEARCH_PACKAGES,
        confidence: 0.9
      };
    }

    // Plan a trip - allow as navigation to start fresh journey
    if (/i\s*want\s*to\s*(plan|go)\s*(a\s*)?(trip|vacation|holiday|tour)|plan\s*(a\s*)?(trip|vacation|holiday|tour)|let('s|s)?\s*(plan|go)/i.test(message)) {
      return {
        intent: INTENTS.SEARCH_DESTINATION,
        confidence: 0.85
      };
    }

    return null;
  }

  /**
   * Detect intent using OpenAI
   */
  async detectWithOpenAI(message, context) {
    const contextInfo = context.currentStep ? `Current step: ${context.currentStep}` : '';

    const response = await this.openai.chat.completions.create({
      model: openaiConfig.model,
      temperature: openaiConfig.temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: INTENT_DETECTION_PROMPT },
        { role: 'user', content: `${contextInfo}\n\nUser message: "${message}"` }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const result = JSON.parse(content);
    return {
      intent: result.intent || INTENTS.FALLBACK,
      confidence: result.confidence || 0.5,
      entities: result.entities || {}
    };
  }

  /**
   * Detect intent using keyword patterns (fallback)
   */
  detectWithKeywords(message, context) {
    const lowerMessage = message.toLowerCase().trim();
    const entities = this.extractEntities(lowerMessage, context);

    // Check for small talk FIRST (casual conversation handling)
    // Small talk has higher priority than other intents
    const smallTalkResult = this.detectSmallTalk(lowerMessage, context);
    if (smallTalkResult) {
      console.log(`[IntentDetector] Small talk detected: ${smallTalkResult.subtype}`);
      return {
        ...smallTalkResult,
        entities
      };
    }

    // Check for affirmation/negation (context-dependent)
    if (AFFIRMATION_PATTERNS.test(lowerMessage)) {
      return {
        intent: INTENTS.AFFIRMATION,
        confidence: 0.85,
        entities,
        subtype: 'yes'
      };
    }

    if (NEGATION_PATTERNS.test(lowerMessage)) {
      return {
        intent: INTENTS.NEGATION,
        confidence: 0.85,
        entities,
        subtype: 'no'
      };
    }

    // IMPORTANT: Context-aware detection FIRST for certain steps
    // This prevents generic patterns (like "family" -> trip type) from overriding
    // step-specific inputs (like "family of 4" -> travelers count)
    const contextPrioritySteps = ['AWAITING_TRAVELERS', 'AWAITING_DATE', 'AWAITING_NAME', 'AWAITING_EMAIL', 'AWAITING_PHONE'];
    if (context.currentStep && contextPrioritySteps.includes(context.currentStep)) {
      const contextIntent = this.detectFromContext(lowerMessage, context, entities);
      if (contextIntent) {
        return {
          intent: contextIntent,
          confidence: 0.85,
          entities
        };
      }
    }

    // Check each travel-related pattern
    for (const [intent, pattern] of Object.entries(KEYWORD_PATTERNS)) {
      if (pattern.test(lowerMessage)) {
        return {
          intent,
          confidence: 0.8,
          entities
        };
      }
    }

    // Context-aware detection for other steps
    if (context.currentStep) {
      const contextIntent = this.detectFromContext(lowerMessage, context, entities);
      if (contextIntent) {
        return {
          intent: contextIntent,
          confidence: 0.75,
          entities
        };
      }
    }

    // If entities found but no clear intent, infer from entities
    if (entities.destination) {
      return {
        intent: INTENTS.SEARCH_DESTINATION,
        confidence: 0.7,
        entities
      };
    }

    if (entities.travelers) {
      return {
        intent: INTENTS.PROVIDE_TRAVELERS,
        confidence: 0.7,
        entities
      };
    }

    // If we have a date entity, it's likely a date input
    if (entities.date) {
      return {
        intent: INTENTS.PROVIDE_TRAVEL_DATE,
        confidence: 0.75,
        entities
      };
    }

    // If we have a name entity during contact step
    if (entities.name && context.currentStep === 'AWAITING_CONTACT') {
      return {
        intent: INTENTS.PROVIDE_CONTACT,
        confidence: 0.8,
        entities
      };
    }

    // Default fallback
    return {
      intent: INTENTS.FALLBACK,
      confidence: 0.3,
      entities
    };
  }

  /**
   * Detect small talk / casual conversation
   * Returns subtype for appropriate response generation
   */
  detectSmallTalk(message, context) {
    // Check each small talk pattern
    for (const [subtype, pattern] of Object.entries(SMALL_TALK_PATTERNS)) {
      if (pattern.test(message)) {
        return {
          intent: INTENTS.SMALL_TALK,
          confidence: 0.9,
          subtype
        };
      }
    }

    // Check for minimal acknowledgments (ok, hmm, etc.)
    if (MINIMAL_ACK_PATTERNS.test(message)) {
      return {
        intent: INTENTS.SMALL_TALK,
        confidence: 0.85,
        subtype: 'acknowledgment'
      };
    }

    return null;
  }

  /**
   * Extract entities from message
   */
  extractEntities(message, context = {}) {
    const entities = {};

    // Extract destination
    for (const dest of DESTINATION_KEYWORDS) {
      if (message.includes(dest)) {
        entities.destination = dest.charAt(0).toUpperCase() + dest.slice(1);
        break;
      }
    }

    // Extract trip type
    for (const [type, keywords] of Object.entries(TRIP_TYPE_KEYWORDS)) {
      if (keywords.some(kw => message.includes(kw))) {
        entities.tripType = type;
        break;
      }
    }

    // Extract travelers count
    const travelerMatch = message.match(/(\d+)\s*(people|person|adults?|travelers?|travellers?|members?|pax)/i);
    if (travelerMatch) {
      entities.travelers = {
        total: parseInt(travelerMatch[1], 10)
      };
    }

    // Extract adults/children specifically
    const adultMatch = message.match(/(\d+)\s*adults?/i);
    const childMatch = message.match(/(\d+)\s*(child|children|kids?)/i);
    if (adultMatch || childMatch) {
      entities.travelers = entities.travelers || {};
      if (adultMatch) entities.travelers.adults = parseInt(adultMatch[1], 10);
      if (childMatch) entities.travelers.children = parseInt(childMatch[1], 10);
      entities.travelers.total = (entities.travelers.adults || 0) + (entities.travelers.children || 0);
    }

    // PRIORITY: Extract date BEFORE budget to avoid misinterpreting "12 march" as budget
    const dateInfo = this.extractDate(message);
    if (dateInfo) {
      entities.date = dateInfo;
    }

    // Extract budget - only if it looks like a budget (has budget keywords or standalone number with k/lakh)
    // AND doesn't contain month names (to avoid "12 march" being parsed as ₹12)
    const hasMonthName = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(message);
    const hasBudgetKeyword = /\b(budget|under|below|around|within|max|upto|rupee|rs|₹)\b/i.test(message);
    const hasKorLakh = /\d+\s*(k|thousand|lac|lakh)\b/i.test(message);

    if (!hasMonthName && (hasBudgetKeyword || hasKorLakh)) {
      const budgetMatch = message.match(/(under|below|around|within|max|upto|budget)?\s*₹?\s*rs?\s*(\d+)\s*(k|thousand|lac|lakh)?/i);
      if (budgetMatch) {
        let amount = parseInt(budgetMatch[2], 10);
        const multiplier = budgetMatch[3]?.toLowerCase();
        if (multiplier === 'k' || multiplier === 'thousand') {
          amount *= 1000;
        } else if (multiplier === 'lac' || multiplier === 'lakh') {
          amount *= 100000;
        }
        entities.budget = { max: amount };
      }
    }

    // Extract package ID
    const packageMatch = message.match(/PKG_[A-Z]+_\d+/i);
    if (packageMatch) {
      entities.packageId = packageMatch[0].toUpperCase();
    }

    // Extract email
    const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      entities.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = message.match(/(\+91|91)?[\s-]?[6-9]\d{9}/);
    if (phoneMatch) {
      entities.phone = phoneMatch[0].replace(/[\s-]/g, '');
    }

    // Extract name when:
    // 1. We're in AWAITING_CONTACT step, OR
    // 2. We have all booking basics (destination, date, travelers, package) and need contact info
    // Only extract if no other entities (email/phone) were found
    const isAwaitingContact = context.currentStep === 'AWAITING_CONTACT' ||
                              (context.selectedPackageId && context.travelDate && context.travelers && !context.contact?.name);
    if (isAwaitingContact && !entities.email && !entities.phone) {
      const name = this.extractName(message, context);
      if (name) {
        entities.name = name;
      }
    }

    return entities;
  }

  /**
   * Extract date from message
   * Handles formats like: "12 march", "march 12", "12th march", "next month", "15/03/2024"
   */
  extractDate(message) {
    const months = {
      jan: 'January', january: 'January',
      feb: 'February', february: 'February',
      mar: 'March', march: 'March',
      apr: 'April', april: 'April',
      may: 'May',
      jun: 'June', june: 'June',
      jul: 'July', july: 'July',
      aug: 'August', august: 'August',
      sep: 'September', sept: 'September', september: 'September',
      oct: 'October', october: 'October',
      nov: 'November', november: 'November',
      dec: 'December', december: 'December'
    };

    // Pattern: "12 march", "12th march", "march 12", "march 12th"
    const dateMonthPattern = /(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)/i;
    const monthDatePattern = /(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i;

    let match = message.match(dateMonthPattern);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = months[match[2].toLowerCase()];
      if (day >= 1 && day <= 31) {
        return `${day} ${month}`;
      }
    }

    match = message.match(monthDatePattern);
    if (match) {
      const month = months[match[1].toLowerCase()];
      const day = parseInt(match[2], 10);
      if (day >= 1 && day <= 31) {
        return `${day} ${month}`;
      }
    }

    // Pattern: just month name (e.g., "march", "next month")
    const justMonthPattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\b/i;
    match = message.match(justMonthPattern);
    if (match) {
      return months[match[1].toLowerCase()];
    }

    // Relative dates
    if (/\bthis\s+month\b/i.test(message)) {
      const now = new Date();
      return months[Object.keys(months)[now.getMonth() * 2]];
    }
    if (/\bnext\s+month\b/i.test(message)) {
      const now = new Date();
      const nextMonth = (now.getMonth() + 1) % 12;
      return months[Object.keys(months)[nextMonth * 2]];
    }
    if (/\bthis\s+week\b/i.test(message)) {
      return 'This week';
    }
    if (/\bnext\s+week\b/i.test(message)) {
      return 'Next week';
    }
    if (/\bflexible\b/i.test(message)) {
      return 'Flexible dates';
    }
    if (/\bin\s+(\d+)\s*(month|week)s?\b/i.test(message)) {
      const m = message.match(/\bin\s+(\d+)\s*(month|week)s?\b/i);
      return `In ${m[1]} ${m[2]}${parseInt(m[1]) > 1 ? 's' : ''}`;
    }

    return null;
  }

  /**
   * Extract name from message
   * Only called when we're expecting a name input
   */
  extractName(message, context = {}) {
    // Skip if message contains keywords that indicate it's not a name
    const skipKeywords = /^(show|list|what|any|tell|help|book|cancel|change|modify|hi|hello|hey|yes|no|ok|thanks|bye|start|fresh|package|destination)/i;
    if (skipKeywords.test(message.trim())) {
      return null;
    }

    // Skip if it's a question
    if (message.includes('?')) {
      return null;
    }

    // Skip if message is too long (names are usually short)
    const words = message.trim().split(/\s+/);
    if (words.length > 5) {
      return null;
    }

    // Check for common name patterns
    // "My name is X", "I am X", "I'm X", "This is X", "Call me X"
    const namePatterns = [
      /(?:my\s+name\s+is|i\s*(?:am|'m)|this\s+is|call\s+me|it's|its)\s+(.+)/i,
      /^([a-zA-Z]+(?:\s+[a-zA-Z]+){0,3})$/i  // Name pattern (case insensitive)
    ];

    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Validate it looks like a name (2-50 chars, mostly letters)
        if (name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s.']+$/.test(name)) {
          return this.capitalizeName(name);
        }
      }
    }

    // If we're in AWAITING_CONTACT step and missing name, and the message looks like a name
    // (1-4 words, mostly alphabetic, no special commands)
    const isAwaitingContact = context.currentStep === 'AWAITING_CONTACT' ||
                              (context.selectedPackageId && context.travelDate && context.travelers);
    if (isAwaitingContact && !context.contact?.name) {
      const cleanMessage = message.trim();
      if (
        words.length >= 1 &&
        words.length <= 4 &&
        /^[a-zA-Z\s.']+$/.test(cleanMessage) &&
        cleanMessage.length >= 2 &&
        cleanMessage.length <= 50
      ) {
        return this.capitalizeName(cleanMessage);
      }
    }

    return null;
  }

  /**
   * Capitalize name properly
   */
  capitalizeName(name) {
    return name
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Context-aware intent detection
   */
  detectFromContext(message, context, entities = {}) {
    switch (context.currentStep) {
      case 'AWAITING_DESTINATION':
        // Any destination-like text
        if (DESTINATION_KEYWORDS.some(d => message.includes(d))) {
          return INTENTS.SEARCH_DESTINATION;
        }
        break;

      case 'AWAITING_DATE':
        // Date-like patterns - prioritize date detection
        if (entities.date) {
          return INTENTS.PROVIDE_TRAVEL_DATE;
        }
        if (/\d{1,2}|\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|next|this|week|month|flexible/i.test(message)) {
          return INTENTS.PROVIDE_TRAVEL_DATE;
        }
        break;

      case 'AWAITING_TRAVELERS':
        // Number patterns for travelers
        if (entities.travelers) {
          return INTENTS.PROVIDE_TRAVELERS;
        }
        if (/\d+\s*(people|person|adults?|travelers?|travellers?|members?|pax|child|children|kids?)?/i.test(message)) {
          return INTENTS.PROVIDE_TRAVELERS;
        }
        // Natural language patterns: "just the two of us", "couple", "solo", "traveling solo", "family of X", "me and my wife"
        if (/\b(just\s*me|solo|alone|myself|only\s*me|i'?m\s*(a\s*)?solo|travel(l)?ing\s*solo|single\s*traveler|couple|we\s*two|(just\s*)?(the\s*)?two\s*of\s*us|both\s*of\s*us|three\s*of\s*us|four\s*of\s*us|five\s*of\s*us|us\s*two|we\s*(are|r)\s*\d+|me\s*and\s*(my\s*)?(wife|husband|partner|spouse|friend|buddy)|with\s*my\s*(wife|husband|partner|spouse)|family\s*(of\s*)?\d+|family\s*(of\s*)?(two|three|four|five|six|seven|eight))\b/i.test(message)) {
          return INTENTS.PROVIDE_TRAVELERS;
        }
        break;

      case 'AWAITING_PACKAGE_SELECTION':
        // Selection patterns
        if (/first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|\d|yes|this|that/i.test(message)) {
          return INTENTS.SELECT_PACKAGE;
        }
        break;

      case 'AWAITING_CONTACT':
        // Contact info patterns - name, email, or phone
        if (entities.name || entities.email || entities.phone) {
          return INTENTS.PROVIDE_CONTACT;
        }
        // Email pattern
        if (/@/.test(message) || /\.com|\.in|\.org|\.net/i.test(message)) {
          return INTENTS.PROVIDE_CONTACT;
        }
        // Phone pattern
        if (/\d{10}|\+91/.test(message)) {
          return INTENTS.PROVIDE_CONTACT;
        }
        // If we're waiting for name and the message looks like a name
        // (1-4 words, all alphabetic, no special keywords)
        if (!context.contact?.name) {
          const words = message.trim().split(/\s+/);
          const looksLikeName =
            words.length >= 1 &&
            words.length <= 4 &&
            /^[a-zA-Z\s.']+$/.test(message.trim()) &&
            message.trim().length >= 2 &&
            message.trim().length <= 50 &&
            !/^(show|list|what|any|tell|help|book|cancel|change|modify|hi|hello|hey|yes|no|ok|thanks|bye|start|fresh|package|destination)/i.test(message.trim());
          if (looksLikeName) {
            return INTENTS.PROVIDE_CONTACT;
          }
        }
        break;

      case 'CONFIRMING_BOOKING':
        // Confirmation patterns
        if (/yes|confirm|proceed|book|ok|sure/i.test(message)) {
          return INTENTS.INITIATE_BOOKING;
        }
        break;

      default:
        // Check if we have all booking basics and need contact info
        // This handles cases where step might not be AWAITING_CONTACT yet
        if (context.selectedPackageId && context.travelDate && context.travelers && !context.contact?.name) {
          // Check if message looks like a name
          const words = message.trim().split(/\s+/);
          const looksLikeName =
            words.length >= 1 &&
            words.length <= 4 &&
            /^[a-zA-Z\s.']+$/.test(message.trim()) &&
            message.trim().length >= 2 &&
            message.trim().length <= 50 &&
            !/^(show|list|what|any|tell|help|book|cancel|change|modify|hi|hello|hey|yes|no|ok|thanks|bye|start|fresh|package|destination)/i.test(message.trim());
          if (looksLikeName) {
            return INTENTS.PROVIDE_CONTACT;
          }
        }
        break;
    }

    return null;
  }
}

module.exports = {
  IntentDetector,
  INTENTS
};
