const { IntentDetector, INTENTS } = require('./intentDetector');
const { ConversationManager, STEPS } = require('./conversationManager');
const crmClient = require('./crmClient');
const leadService = require('./leadService');
const {
  greetingMessage,
  packagesResponse,
  destinationsResponse,
  packageDetailsResponse,
  incompleteResponse,
  errorResponse,
  successResponse,
  getFieldPrompt,
  getQuickRepliesForField,
  summarizeContext,
  modifyPreferencePrompt,
  contactPrompt,
  bookingConfirmation,
  smallTalkResponse,
  affirmationResponse,
  negationResponse,
  ACTION_TYPES,
  QUICK_REPLIES
} = require('../utils/responseMapper');

/**
 * Chatbot Service - Core conversation handler
 *
 * Responsibilities:
 * 1. Process user messages and generate appropriate responses
 * 2. Maintain conversation context across messages
 * 3. Capture leads for booking intent
 * 4. Handle voice input confirmations
 * 5. Provide MakeMyTrip-style conversational experience
 */
class ChatbotService {
  constructor() {
    this.intentDetector = new IntentDetector();
    this.conversationManager = new ConversationManager();
  }

  /**
   * Process user message and generate response
   * @param {string} sessionId - Session ID
   * @param {string} userMessage - User's message
   * @param {object} incomingContext - Optional context from frontend
   * @param {number} userId - Optional user ID for logged-in users
   * @param {object} options - Additional options (isVoiceInput, etc.)
   */
  async processMessage(sessionId, userMessage, incomingContext = {}, userId = null, options = {}) {
    try {
      // Get or create session
      const session = await this.conversationManager.getOrCreateSession(sessionId, userId);
      const context = this.conversationManager.getContext(session);

      // Merge incoming context
      Object.assign(context, incomingContext);

      // Track voice input
      const isVoiceInput = options.isVoiceInput || false;

      // Save user message with voice flag
      await this.conversationManager.saveMessage(sessionId, 'user', userMessage, {
        isVoiceInput
      });

      // Detect intent
      const { intent, confidence, entities, subtype } = await this.intentDetector.detectIntent(userMessage, context);

      // Process based on intent (pass subtype for small talk handling, rawMessage for general chat)
      let response = await this.handleIntent(sessionId, intent, { ...entities, subtype, rawMessage: userMessage }, context, userId);

      // Add voice confirmation for critical inputs if voice was used
      if (isVoiceInput && this.needsVoiceConfirmation(intent, entities)) {
        response = this.addVoiceConfirmation(response, intent, entities);
      }

      // Add quick suggestions to response
      response.suggestions = crmClient.getQuickSuggestions(context.currentStep);

      // Capture lead if booking intent detected
      if (this.shouldCaptureLead(intent, context)) {
        await leadService.captureLeadFromContext(sessionId, context, userId, {
          bookingIntent: intent === INTENTS.INITIATE_BOOKING,
          source: isVoiceInput ? 'chatbot_voice' : 'chatbot'
        });
      }

      // Save assistant message
      await this.conversationManager.saveMessage(sessionId, 'assistant', response.message, {
        intent,
        confidence,
        entities,
        action: response.action
      });

      return response;
    } catch (error) {
      console.error('ChatbotService.processMessage error:', error);
      // User-friendly error message - never expose technical details
      return errorResponse(
        'SERVICE_UNAVAILABLE',
        "I'm having a little trouble right now. Could you please try again in a moment?",
        true
      );
    }
  }

  /**
   * Check if voice input needs confirmation for critical data
   */
  needsVoiceConfirmation(intent, entities) {
    const criticalIntents = [
      INTENTS.PROVIDE_TRAVEL_DATE,
      INTENTS.PROVIDE_BUDGET,
      INTENTS.PROVIDE_TRAVELERS,
      INTENTS.PROVIDE_CONTACT,
      INTENTS.INITIATE_BOOKING
    ];
    return criticalIntents.includes(intent);
  }

  /**
   * Add voice confirmation prompt to response
   * Per spec: Always confirm travel dates, budget, travelers, phone, email for voice input
   */
  addVoiceConfirmation(response, intent, entities) {
    let confirmation = '';
    let confirmationType = null;

    switch (intent) {
      case INTENTS.PROVIDE_TRAVEL_DATE:
        if (entities.date || entities.travelDate) {
          const date = entities.date || entities.travelDate;
          confirmation = `\n\n🎤 **Voice confirmation**: I heard you want to travel on **"${date}"**. Is that correct?`;
          confirmationType = 'travel_date';
        }
        break;
      case INTENTS.PROVIDE_BUDGET:
        if (entities.budget?.max) {
          confirmation = `\n\n🎤 **Voice confirmation**: Budget set to **₹${entities.budget.max.toLocaleString('en-IN')}**. Is that right?`;
          confirmationType = 'budget';
        }
        break;
      case INTENTS.PROVIDE_TRAVELERS:
        if (entities.travelers) {
          const t = entities.travelers;
          let travelerStr = `${t.total || t.adults || 1} traveler(s)`;
          if (t.adults && t.children) {
            travelerStr = `${t.adults} adult(s) and ${t.children} child(ren)`;
          }
          confirmation = `\n\n🎤 **Voice confirmation**: **${travelerStr}**. Is this correct?`;
          confirmationType = 'travelers';
        }
        break;
      case INTENTS.PROVIDE_CONTACT:
        const parts = [];
        if (entities.name) parts.push(`Name: **${entities.name}**`);
        if (entities.email) parts.push(`Email: **${entities.email}**`);
        if (entities.phone) parts.push(`Phone: **${entities.phone}**`);
        if (parts.length > 0) {
          confirmation = `\n\n🎤 **Voice confirmation**: Just to confirm - ${parts.join(', ')}. Is this correct?`;
          confirmationType = 'contact';
        }
        break;
      case INTENTS.INITIATE_BOOKING:
        confirmation = `\n\n🎤 **Voice confirmation**: You want to proceed with booking. Is that correct?`;
        confirmationType = 'booking';
        break;
    }

    if (confirmation) {
      response.message += confirmation;
      response.needsConfirmation = true;
      response.confirmationType = confirmationType;

      // Add yes/no quick replies for voice confirmation
      response.data = response.data || {};
      response.data.quick_replies = [
        { text: 'Yes, correct', value: 'Yes, that is correct' },
        { text: 'No, let me fix it', value: 'No, that is wrong' }
      ];
      response.data.suggestions = ['Yes, correct', 'No, let me fix it'];
    }

    return response;
  }

  /**
   * Determine if we should capture a lead
   */
  shouldCaptureLead(intent, context) {
    // Capture when:
    // 1. User shows booking intent
    // 2. User provides contact info
    // 3. User selects a package
    // 4. User provides significant details
    const captureIntents = [
      INTENTS.INITIATE_BOOKING,
      INTENTS.PROVIDE_CONTACT,
      INTENTS.SELECT_PACKAGE,
      INTENTS.CHECK_AVAILABILITY
    ];

    if (captureIntents.includes(intent)) return true;

    // Also capture if context has meaningful data
    return !!(
      context.selectedPackageId ||
      (context.destination && context.travelDate) ||
      context.contact?.email ||
      context.contact?.phone
    );
  }

  /**
   * Handle intent and generate response
   */
  async handleIntent(sessionId, intent, entities, context, userId = null) {
    // Reset fallback counter on successful intent detection
    if (intent !== INTENTS.FALLBACK && context.fallbackCount > 0) {
      await this.conversationManager.updateContext(sessionId, { fallbackCount: 0 });
    }

    switch (intent) {
      case INTENTS.GREETING:
        return this.handleGreeting(sessionId);

      // Small talk / casual conversation
      case INTENTS.SMALL_TALK:
        return this.handleSmallTalk(sessionId, entities, context);

      // General AI chat
      case INTENTS.GENERAL_CHAT:
        return this.handleGeneralChat(sessionId, entities, context);

      // Affirmation (yes, ok, sure)
      case INTENTS.AFFIRMATION:
        return this.handleAffirmation(sessionId, entities, context, userId);

      // Negation (no, not really)
      case INTENTS.NEGATION:
        return this.handleNegation(sessionId, entities, context);

      case INTENTS.SEARCH_DESTINATION:
        return this.handleSearchDestination(sessionId, entities, context);

      case INTENTS.SEARCH_PACKAGES:
        return this.handleSearchPackages(sessionId, entities, context);

      case INTENTS.GET_PACKAGE_DETAILS:
        return this.handleGetPackageDetails(sessionId, entities, context);

      case INTENTS.SELECT_PACKAGE:
        return this.handleSelectPackage(sessionId, entities, context);

      case INTENTS.PROVIDE_TRAVEL_DATE:
        return this.handleProvideDate(sessionId, entities, context);

      case INTENTS.PROVIDE_TRAVELERS:
        return this.handleProvideTravelers(sessionId, entities, context);

      case INTENTS.PROVIDE_TRIP_TYPE:
        return this.handleProvideTripType(sessionId, entities, context);

      case INTENTS.PROVIDE_BUDGET:
        return this.handleProvideBudget(sessionId, entities, context);

      case INTENTS.PROVIDE_CONTACT:
        return this.handleProvideContact(sessionId, entities, context, userId);

      case INTENTS.CHECK_AVAILABILITY:
        return this.handleCheckAvailability(sessionId, entities, context);

      case INTENTS.INITIATE_BOOKING:
        return this.handleInitiateBooking(sessionId, context, userId);

      case INTENTS.MODIFY_PREFERENCE:
        return this.handleModifyPreference(sessionId, entities, context);

      case INTENTS.TALK_TO_EXPERT:
        return this.handleTalkToExpert(sessionId, context, userId);

      case INTENTS.FAQ:
        return this.handleFAQ(sessionId, entities, context);

      case INTENTS.CANCEL:
        return this.handleCancel(sessionId);

      case INTENTS.FALLBACK:
      default:
        return this.handleFallback(sessionId, context);
    }
  }

  /**
   * Handle small talk / casual conversation
   * Friendly response, then gently guide back to travel
   */
  async handleSmallTalk(sessionId, entities, context) {
    const subtype = entities.subtype || 'acknowledgment';
    return smallTalkResponse(subtype, context);
  }

  /**
   * Handle general AI chat - respond to casual questions and conversation
   * Uses OpenAI to generate natural responses while staying in character
   */
  async handleGeneralChat(sessionId, entities, context) {
    try {
      const { getOpenAIClient } = require('../config/openai');
      const { GENERAL_CHAT_PROMPT } = require('../prompts/systemPrompt');
      const openai = getOpenAIClient();

      if (!openai) {
        // Fallback if OpenAI is not available
        return successResponse(
          ACTION_TYPES.SHOW_MESSAGE,
          "I'm your travel assistant! While I'd love to chat more, I'm best at helping you plan amazing trips. 🌍\n\nWhere would you like to travel?",
          {
            suggestions: ['Show destinations', 'Popular packages', 'Talk to expert'],
            quick_replies: QUICK_REPLIES.general
          },
          context
        );
      }

      // Get the user's message from the last saved message or use a default
      const userMessage = entities.rawMessage || "Hello";

      const contextSummary = context.destination
        ? `User is planning a trip to ${context.destination}${context.travelDate ? ` on ${context.travelDate}` : ''}.`
        : 'User is exploring travel options.';

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 150,
        messages: [
          {
            role: 'system',
            content: GENERAL_CHAT_PROMPT.replace('{context}', contextSummary)
          },
          { role: 'user', content: userMessage }
        ]
      });

      const aiResponse = response.choices[0]?.message?.content ||
        "I'm here to help you plan your perfect trip! Where would you like to go?";

      // Add travel suggestion if not already included
      const finalMessage = aiResponse.includes('travel') || aiResponse.includes('trip') || aiResponse.includes('destination')
        ? aiResponse
        : `${aiResponse}\n\nBy the way, is there a destination you'd like to explore?`;

      return successResponse(
        ACTION_TYPES.SHOW_MESSAGE,
        finalMessage,
        {
          suggestions: ['Show destinations', 'Popular packages', 'Talk to expert'],
          quick_replies: QUICK_REPLIES.general
        },
        context
      );
    } catch (error) {
      console.error('General chat error:', error);
      return successResponse(
        ACTION_TYPES.SHOW_MESSAGE,
        "I'm your travel assistant, and I'm best at helping you discover amazing destinations! 🌴\n\nWhere would you like to go?",
        {
          suggestions: ['Show destinations', 'Popular packages', 'Talk to expert'],
          quick_replies: QUICK_REPLIES.general
        },
        context
      );
    }
  }

  /**
   * Handle affirmation (yes, ok, sure, correct)
   * Context-aware - proceed based on current step
   */
  async handleAffirmation(sessionId, entities, context, userId = null) {
    const step = context.currentStep;

    // If we're awaiting voice confirmation, proceed with the confirmed data
    if (context.awaitingConfirmation) {
      await this.conversationManager.updateContext(sessionId, {
        awaitingConfirmation: false
      });
      // Proceed to next step
      const nextStep = this.conversationManager.getMissingFields(context)[0];
      if (nextStep) {
        return incompleteResponse(
          `Great! ${getFieldPrompt(nextStep)}`,
          [nextStep],
          context
        );
      }
    }

    // If we're at booking confirmation, proceed with booking
    if (step === 'CONFIRMING_BOOKING' || step === 'AWAITING_CONFIRMATION') {
      return this.handleInitiateBooking(sessionId, context, userId);
    }

    // Default: use the affirmation response which prompts next step
    return affirmationResponse(context);
  }

  /**
   * Handle negation (no, not really, wrong)
   * Offer alternatives based on current step
   */
  async handleNegation(sessionId, entities, context) {
    const step = context.currentStep;

    // If awaiting voice confirmation, ask to repeat
    if (context.awaitingConfirmation) {
      await this.conversationManager.updateContext(sessionId, {
        awaitingConfirmation: false
      });
      return incompleteResponse(
        "No problem! Let me ask again. " + getFieldPrompt(this.conversationManager.getMissingFields(context)[0] || 'destination'),
        [this.conversationManager.getMissingFields(context)[0] || 'destination'],
        context
      );
    }

    return negationResponse(context);
  }

  /**
   * Handle preference modification request
   */
  async handleModifyPreference(sessionId, entities, context) {
    // Check what the user wants to modify
    const modifyWhat = this.detectModificationTarget(entities);

    if (modifyWhat) {
      // Clear the specific preference and ask again
      const updates = {};
      let prompt = '';

      switch (modifyWhat) {
        case 'destination':
          updates.destination = null;
          updates.lastPackages = [];
          updates.currentStep = STEPS.AWAITING_DESTINATION;
          prompt = getFieldPrompt('destination');
          break;
        case 'date':
          updates.travelDate = null;
          updates.currentStep = STEPS.AWAITING_DATE;
          prompt = getFieldPrompt('travel_date');
          break;
        case 'travelers':
          updates.travelers = null;
          updates.currentStep = STEPS.AWAITING_TRAVELERS;
          prompt = getFieldPrompt('travelers');
          break;
        case 'package':
          updates.selectedPackageId = null;
          updates.selectedPackage = null;
          updates.currentStep = STEPS.SHOWING_PACKAGES;
          // Show packages again
          if (context.destination) {
            const result = await crmClient.searchPackages({
              destination: context.destination,
              limit: 5
            });
            if (result.success && result.data.packages?.length > 0) {
              return packagesResponse(
                result.data.packages,
                context,
                `Sure! Here are the packages for ${context.destination} again:`
              );
            }
          }
          prompt = "Which package would you prefer?";
          break;
        case 'budget':
          updates.budget = null;
          prompt = getFieldPrompt('budget');
          break;
        default:
          return modifyPreferencePrompt(context);
      }

      await this.conversationManager.updateContext(sessionId, updates);
      return incompleteResponse(prompt, [modifyWhat], context);
    }

    // Show what can be modified
    return modifyPreferencePrompt(context);
  }

  /**
   * Detect what the user wants to modify
   */
  detectModificationTarget(entities) {
    const text = Object.values(entities).join(' ').toLowerCase();

    if (text.includes('destination') || text.includes('place') || text.includes('location')) {
      return 'destination';
    }
    if (text.includes('date') || text.includes('when') || text.includes('time')) {
      return 'date';
    }
    if (text.includes('traveler') || text.includes('people') || text.includes('person')) {
      return 'travelers';
    }
    if (text.includes('package') || text.includes('trip') || text.includes('tour')) {
      return 'package';
    }
    if (text.includes('budget') || text.includes('price') || text.includes('cost')) {
      return 'budget';
    }

    return null;
  }

  /**
   * Handle talk to expert / callback request
   */
  async handleTalkToExpert(sessionId, context, userId = null) {
    // Check if we have contact info
    const missingContact = leadService.getMissingContactFields(context);

    if (missingContact.includes('phone')) {
      // Need phone number for callback
      await this.conversationManager.updateContext(sessionId, {
        currentStep: STEPS.AWAITING_CONTACT,
        callbackRequested: true
      });

      return incompleteResponse(
        "I'll connect you with a travel expert! **What's your phone number?**\n\nOur expert will call you shortly.",
        ['phone'],
        context,
        [{ text: 'Use email instead', value: 'Contact me by email' }]
      );
    }

    // Capture lead with callback request
    await leadService.captureLeadFromContext(sessionId, context, userId, {
      callbackRequested: true,
      source: 'chatbot_callback',
      notes: 'User requested to talk to expert'
    });

    return successResponse(
      ACTION_TYPES.CALLBACK_REQUESTED,
      `**Got it!** 📞\n\nOur travel expert will call you at **${context.contact.phone}** within the next few hours.\n\n${summarizeContext(context)}\n\nIs there anything else you'd like to explore in the meantime?`,
      {
        callbackRequested: true,
        phone: context.contact.phone,
        suggestions: ['Show me more packages', 'Explore destinations'],
        quick_replies: [
          { text: 'Show packages', value: 'Show me packages' },
          { text: 'Explore destinations', value: 'Show me destinations' }
        ]
      },
      context
    );
  }

  /**
   * Handle greeting
   */
  async handleGreeting(sessionId) {
    await this.conversationManager.updateContext(sessionId, {
      currentStep: STEPS.AWAITING_DESTINATION
    });
    return greetingMessage();
  }

  /**
   * Handle destination search
   */
  async handleSearchDestination(sessionId, entities, context) {
    if (entities.destination) {
      // Search for packages in this destination
      const result = await crmClient.searchPackages({
        destination: entities.destination,
        tripType: entities.tripType || context.tripType,
        limit: 5
      });

      if (result.success && result.data.packages && result.data.packages.length > 0) {
        const newContext = await this.conversationManager.updateContext(sessionId, {
          destination: entities.destination,
          tripType: entities.tripType || context.tripType,
          currentStep: STEPS.SHOWING_PACKAGES,
          lastPackages: result.data.packages
        });

        return packagesResponse(
          result.data.packages,
          newContext,
          `Great choice! Here are the best packages for ${entities.destination}:`
        );
      }

      // No packages found, show destinations
      const destinations = await crmClient.getDestinations();
      if (destinations.success) {
        return destinationsResponse(
          destinations.data,
          `I couldn't find packages for "${entities.destination}". Here are our available destinations:`
        );
      }
    }

    // Show all destinations
    const destinations = await crmClient.getDestinations();
    if (destinations.success && destinations.data.length > 0) {
      await this.conversationManager.updateContext(sessionId, {
        currentStep: STEPS.AWAITING_DESTINATION
      });
      return destinationsResponse(destinations.data);
    }

    return errorResponse('CRM_SERVICE_UNAVAILABLE', 'Unable to fetch destinations. Please try again.', true);
  }

  /**
   * Handle package search
   */
  async handleSearchPackages(sessionId, entities, context) {
    const filters = {
      destination: entities.destination || context.destination,
      tripType: entities.tripType || context.tripType,
      minBudget: entities.budget?.min || context.budget?.min,
      maxBudget: entities.budget?.max || context.budget?.max,
      travelers: entities.travelers?.total || context.travelers?.total,
      limit: 5
    };

    // If no destination, show featured packages
    if (!filters.destination) {
      const result = await crmClient.getFeaturedPackages(5);
      if (result.success && result.data.length > 0) {
        const newContext = await this.conversationManager.updateContext(sessionId, {
          currentStep: STEPS.SHOWING_PACKAGES,
          lastPackages: result.data
        });
        return packagesResponse(result.data, newContext, "Here are our featured packages:");
      }
    }

    const result = await crmClient.searchPackages(filters);
    if (result.success && result.data.packages && result.data.packages.length > 0) {
      const newContext = await this.conversationManager.updateContext(sessionId, {
        destination: filters.destination,
        tripType: filters.tripType,
        budget: entities.budget || context.budget,
        currentStep: STEPS.SHOWING_PACKAGES,
        lastPackages: result.data.packages
      });
      return packagesResponse(result.data.packages, newContext);
    }

    // No results with filters, try without filters
    if (filters.destination) {
      const broadResult = await crmClient.searchPackages({ destination: filters.destination, limit: 5 });
      if (broadResult.success && broadResult.data.packages?.length > 0) {
        return packagesResponse(
          broadResult.data.packages,
          context,
          `I found these packages for ${filters.destination}. Try adjusting your preferences for more options:`
        );
      }
    }

    return incompleteResponse(
      "I couldn't find packages matching your criteria. Let me help you search.\n\n" + getFieldPrompt('destination'),
      ['destination'],
      context
    );
  }

  /**
   * Handle package details request
   */
  async handleGetPackageDetails(sessionId, entities, context) {
    const packageId = entities.packageId;

    if (!packageId) {
      return incompleteResponse(
        "Which package would you like to know more about?",
        ['package_id'],
        context
      );
    }

    const result = await crmClient.getPackageById(packageId);
    if (result.success && result.data) {
      const newContext = await this.conversationManager.updateContext(sessionId, {
        currentStep: STEPS.AWAITING_PACKAGE_SELECTION
      });
      return packageDetailsResponse(result.data, newContext);
    }

    return errorResponse('PACKAGE_NOT_FOUND', `Package "${packageId}" not found.`, false);
  }

  /**
   * Handle package selection
   */
  async handleSelectPackage(sessionId, entities, context) {
    let selectedPackage = null;

    // Check if package ID provided
    if (entities.packageId) {
      const result = await crmClient.getPackageById(entities.packageId);
      if (result.success) {
        selectedPackage = result.data;
      }
    }

    // Check if selecting from last shown packages by number
    if (!selectedPackage && context.lastPackages && context.lastPackages.length > 0) {
      // Try to find by position (first, second, 1, 2, etc.)
      const positionMatch = entities.position || this.extractPosition(entities);
      if (positionMatch !== null && positionMatch < context.lastPackages.length) {
        selectedPackage = context.lastPackages[positionMatch];
      }
    }

    if (selectedPackage) {
      const newContext = await this.conversationManager.updateContext(sessionId, {
        selectedPackageId: selectedPackage.packageId,
        selectedPackage: {
          packageId: selectedPackage.packageId,
          title: selectedPackage.title,
          price: selectedPackage.price,
          discountPrice: selectedPackage.discountPrice
        },
        currentStep: STEPS.AWAITING_DATE
      });

      const nextStep = this.conversationManager.getMissingFields(newContext)[0];
      return successResponse(
        ACTION_TYPES.SHOW_MESSAGE,
        `Excellent choice! You've selected **${selectedPackage.title}** (${selectedPackage.duration}) at ₹${selectedPackage.discountPrice || selectedPackage.price}/person.\n\n${getFieldPrompt(nextStep)}`,
        { selected_package: selectedPackage },
        newContext,
        getFieldPrompt(nextStep)
      );
    }

    return incompleteResponse(
      "I'm not sure which package you meant. Could you tell me the package name or number from the list?",
      ['package_selection'],
      context
    );
  }

  /**
   * Handle travel date input
   */
  async handleProvideDate(sessionId, entities, context) {
    // Use the extracted date or try to parse from the raw message
    const dateStr = entities.date || entities.travelDate;

    if (!dateStr) {
      // No valid date found, ask again
      return incompleteResponse(
        "I couldn't understand that date. Could you please tell me when you'd like to travel?\n\nYou can say things like '12 March', 'next month', or 'flexible dates'.",
        ['travel_date'],
        context
      );
    }

    // Clear any incorrectly saved budget from previous date parsing issues
    const updates = {
      travelDate: dateStr,
      currentStep: STEPS.AWAITING_TRAVELERS
    };

    // If budget was incorrectly set from a date like "12 march", clear it
    if (context.budget?.max && context.budget.max < 100) {
      updates.budget = null;
    }

    const newContext = await this.conversationManager.updateContext(sessionId, updates);

    const nextStep = this.conversationManager.getMissingFields(newContext)[0];
    return successResponse(
      ACTION_TYPES.SHOW_MESSAGE,
      `Perfect! You're planning to travel in **${dateStr}**.${summarizeContext(newContext)}\n\n${getFieldPrompt(nextStep || 'travelers')}`,
      null,
      newContext,
      getFieldPrompt(nextStep || 'travelers')
    );
  }

  /**
   * Handle travelers count input
   */
  async handleProvideTravelers(sessionId, entities, context) {
    let travelers = entities.travelers;

    // If no travelers entity, try to parse from raw message
    if (!travelers && entities.rawMessage) {
      travelers = this.parseTravelers(entities.rawMessage);
    }

    // Default to 2 if still no travelers
    if (!travelers) {
      travelers = { total: 2 };
    }

    // Ensure total is calculated
    if (!travelers.total && (travelers.adults || travelers.children)) {
      travelers.total = (travelers.adults || 0) + (travelers.children || 0);
    }

    const newContext = await this.conversationManager.updateContext(sessionId, {
      travelers,
      currentStep: context.selectedPackageId ? STEPS.AWAITING_CONTACT : STEPS.AWAITING_PACKAGE_SELECTION
    });

    // Build friendly travelers string
    let travelerStr = `${travelers.total} traveler${travelers.total > 1 ? 's' : ''}`;
    if (travelers.adults && travelers.children) {
      travelerStr = `${travelers.adults} adult${travelers.adults > 1 ? 's' : ''} and ${travelers.children} child${travelers.children > 1 ? 'ren' : ''}`;
    } else if (travelers.adults) {
      travelerStr = `${travelers.adults} adult${travelers.adults > 1 ? 's' : ''}`;
    }

    // If we have destination but no package, show packages
    if (context.destination && !context.selectedPackageId) {
      const result = await crmClient.searchPackages({
        destination: context.destination,
        travelers: travelers.total,
        limit: 5
      });

      if (result.success && result.data.packages?.length > 0) {
        await this.conversationManager.updateContext(sessionId, {
          lastPackages: result.data.packages,
          currentStep: STEPS.SHOWING_PACKAGES
        });
        return packagesResponse(
          result.data.packages,
          newContext,
          `Great! ${travelerStr} traveling. Here are the best packages for you:`
        );
      }
    }

    const nextStep = this.conversationManager.getMissingFields(newContext)[0];

    // If next step is contact info (name, email, phone), use contactPrompt for better UX
    if (nextStep === 'name' || nextStep === 'email' || nextStep === 'phone') {
      return contactPrompt(nextStep, newContext, true);
    }

    return successResponse(
      ACTION_TYPES.SHOW_MESSAGE,
      `Got it! ${travelerStr} - noted!${summarizeContext(newContext)}\n\n${getFieldPrompt(nextStep)}`,
      null,
      newContext,
      getFieldPrompt(nextStep)
    );
  }

  /**
   * Parse travelers from raw message
   */
  parseTravelers(message) {
    const lowerMessage = message.toLowerCase();

    // Try to extract adults and children
    const adultMatch = lowerMessage.match(/(\d+)\s*adults?/i);
    const childMatch = lowerMessage.match(/(\d+)\s*(child|children|kids?)/i);

    if (adultMatch || childMatch) {
      const adults = adultMatch ? parseInt(adultMatch[1], 10) : 0;
      const children = childMatch ? parseInt(childMatch[1], 10) : 0;
      return {
        adults,
        children,
        total: adults + children
      };
    }

    // Try to extract just a number
    const numMatch = lowerMessage.match(/(\d+)\s*(people|person|travelers?|travellers?|members?|pax)?/i);
    if (numMatch) {
      return { total: parseInt(numMatch[1], 10) };
    }

    // Check for words like "just me", "solo", "traveling solo"
    if (/\b(just\s*me|solo|alone|myself|only\s*me|i'?m\s*(a\s*)?solo|travel(l)?ing\s*solo|single\s*traveler)\b/i.test(lowerMessage)) {
      return { total: 1 };
    }

    // Check for "couple", "two of us", "the two of us", "just the two of us", "me and my wife"
    if (/\b(couple|we\s*two|(just\s*)?(the\s*)?two\s*of\s*us|both\s*of\s*us|me\s*and\s*(my\s*)?(wife|husband|partner|spouse|friend|buddy)|us\s*two|with\s*my\s*(wife|husband|partner|spouse))\b/i.test(lowerMessage)) {
      return { total: 2, adults: 2 };
    }

    // Check for "three of us", "four of us", etc.
    const groupMatch = lowerMessage.match(/\b(three|four|five|six|seven|eight)\s*of\s*us\b/i);
    if (groupMatch) {
      const wordToNum = { three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };
      const num = wordToNum[groupMatch[1].toLowerCase()];
      if (num) return { total: num };
    }

    // Check for "we are X" patterns
    const weAreMatch = lowerMessage.match(/\bwe\s*(are|r)\s*(\d+)\b/i);
    if (weAreMatch) {
      return { total: parseInt(weAreMatch[2], 10) };
    }

    // Check for "family of X" patterns
    const familyMatch = lowerMessage.match(/\bfamily\s*(of\s*)?(\d+)\b/i);
    if (familyMatch) {
      return { total: parseInt(familyMatch[2], 10) };
    }

    // Check for word numbers: "family of four"
    const familyWordMatch = lowerMessage.match(/\bfamily\s*(of\s*)?(two|three|four|five|six|seven|eight)\b/i);
    if (familyWordMatch) {
      const wordToNum = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };
      const num = wordToNum[familyWordMatch[2].toLowerCase()];
      if (num) return { total: num };
    }

    return null;
  }

  /**
   * Handle trip type input
   */
  async handleProvideTripType(sessionId, entities, context) {
    const tripType = entities.tripType;

    const newContext = await this.conversationManager.updateContext(sessionId, {
      tripType,
      currentStep: STEPS.AWAITING_DESTINATION
    });

    // Search packages with trip type
    if (context.destination) {
      const result = await crmClient.searchPackages({
        destination: context.destination,
        tripType,
        limit: 5
      });

      if (result.success && result.data.packages?.length > 0) {
        await this.conversationManager.updateContext(sessionId, {
          lastPackages: result.data.packages,
          currentStep: STEPS.SHOWING_PACKAGES
        });
        return packagesResponse(
          result.data.packages,
          newContext,
          `Here are ${tripType} packages for ${context.destination}:`
        );
      }
    }

    return successResponse(
      ACTION_TYPES.SHOW_MESSAGE,
      `Looking for ${tripType} packages. ${getFieldPrompt('destination')}`,
      null,
      newContext
    );
  }

  /**
   * Handle budget input
   */
  async handleProvideBudget(sessionId, entities, context) {
    const budget = entities.budget || { max: 50000 };

    const newContext = await this.conversationManager.updateContext(sessionId, {
      budget
    });

    // Search with budget filter
    if (context.destination) {
      const result = await crmClient.searchPackages({
        destination: context.destination,
        maxBudget: budget.max,
        tripType: context.tripType,
        limit: 5
      });

      if (result.success && result.data.packages?.length > 0) {
        await this.conversationManager.updateContext(sessionId, {
          lastPackages: result.data.packages,
          currentStep: STEPS.SHOWING_PACKAGES
        });
        return packagesResponse(
          result.data.packages,
          newContext,
          `Here are packages under ₹${budget.max}:`
        );
      }

      return successResponse(
        ACTION_TYPES.SHOW_MESSAGE,
        `No packages found under ₹${budget.max} for ${context.destination}. Would you like to see all available packages?`,
        null,
        newContext
      );
    }

    return incompleteResponse(
      `Budget set to under ₹${budget.max}. ${getFieldPrompt('destination')}`,
      ['destination'],
      newContext
    );
  }

  /**
   * Handle contact information input
   * For logged-in users, we can pre-fill from their profile
   */
  async handleProvideContact(sessionId, entities, context, userId = null) {
    const contact = { ...context.contact };

    // Update contact with provided entities
    if (entities.name) contact.name = entities.name;
    if (entities.email) contact.email = entities.email;
    if (entities.phone) contact.phone = entities.phone;

    const newContext = await this.conversationManager.updateContext(sessionId, {
      contact,
      currentStep: STEPS.AWAITING_CONTACT
    });

    // Check what's still missing
    const missingContactFields = leadService.getMissingContactFields(newContext);

    if (missingContactFields.length === 0) {
      // All contact info collected, ready to book
      return this.handleInitiateBooking(sessionId, newContext, userId);
    }

    // For guests, collect contact info step by step
    const nextField = missingContactFields[0];

    // Friendly prompts for each field - personalized when possible
    const friendlyPrompts = {
      name: `Great choice! To proceed with your ${context.selectedPackage?.title || 'package'} booking, what's your name?`,
      email: `Thanks${contact.name ? `, ${contact.name}` : ''}! What's your email address so we can send the confirmation?`,
      phone: `Almost done${contact.name ? `, ${contact.name}` : ''}! What's your phone number? Our travel expert will contact you to finalize the booking.`
    };

    // Add context-aware quick replies
    const quickReplies = nextField === 'phone' ? [
      { text: 'Talk to expert', value: 'I want to talk to an expert' },
      { text: 'Skip for now', value: 'Skip phone number' }
    ] : null;

    return incompleteResponse(
      friendlyPrompts[nextField] || getFieldPrompt(nextField),
      [nextField],
      newContext,
      quickReplies
    );
  }

  /**
   * Handle availability check
   */
  async handleCheckAvailability(sessionId, entities, context) {
    const packageId = entities.packageId || context.selectedPackageId;
    const travelers = entities.travelers?.total || context.travelers?.total || 2;

    if (!packageId) {
      return incompleteResponse(
        "Which package would you like to check availability for?",
        ['package_selection'],
        context
      );
    }

    const result = await crmClient.checkAvailability(packageId, travelers);
    if (result.success) {
      const { available, slotsAvailable, totalPrice, reason } = result.data;

      if (available) {
        return successResponse(
          ACTION_TYPES.SHOW_MESSAGE,
          `Great news! This package is available with ${slotsAvailable} slots.\n\nTotal price for ${travelers} traveler${travelers > 1 ? 's' : ''}: ₹${totalPrice}\n\nWould you like to book?`,
          result.data,
          context
        );
      } else {
        return successResponse(
          ACTION_TYPES.SHOW_MESSAGE,
          `Sorry, this package is not available. ${reason}\n\nWould you like to see other packages?`,
          result.data,
          context
        );
      }
    }

    return errorResponse('AVAILABILITY_CHECK_FAILED', 'Unable to check availability. Please try again.', true);
  }

  /**
   * Handle booking initiation
   * NOTE: Actual payment is NOT processed here. A travel expert will contact the user.
   */
  async handleInitiateBooking(sessionId, context, userId = null) {
    const missing = this.conversationManager.getMissingFields(context);

    // Check if we have basic booking info
    if (!context.selectedPackageId || !context.destination) {
      return incompleteResponse(
        "Let's find you the perfect package first! Where would you like to travel?",
        ['destination'],
        context
      );
    }

    // For booking, we need contact info
    const missingContactFields = leadService.getMissingContactFields(context);
    if (missingContactFields.length > 0) {
      const nextField = missingContactFields[0];
      await this.conversationManager.updateContext(sessionId, {
        currentStep: STEPS.AWAITING_CONTACT
      });

      return incompleteResponse(
        `Almost there! ${getFieldPrompt(nextField)}`,
        missingContactFields,
        context
      );
    }

    // All info collected - create booking summary and capture lead
    const pkg = context.selectedPackage;
    const travelers = context.travelers?.total || 2;
    const price = pkg.discountPrice || pkg.price;
    const totalPrice = parseFloat(price) * travelers;

    // Capture lead with booking intent
    await leadService.captureLeadFromContext(sessionId, context, userId, {
      bookingIntent: true,
      callbackRequested: true,
      notes: `Booking intent for ${pkg.title} - ${context.destination}`
    });

    await this.conversationManager.updateContext(sessionId, {
      currentStep: STEPS.CONFIRMING_BOOKING
    });

    // Since CRM/Payment is not live, inform user that a travel expert will contact them
    const bookingMessage = `
**🎉 Booking Request Received!**

Here's your trip summary:

📦 **Package:** ${pkg.title}
📍 **Destination:** ${context.destination}
📅 **Travel Date:** ${context.travelDate}
👥 **Travelers:** ${travelers}
💰 **Estimated Total:** ₹${totalPrice.toLocaleString('en-IN')}

**Your Details:**
👤 ${context.contact.name}
📧 ${context.contact.email}
📱 ${context.contact.phone}

---

✨ **What happens next?**
Our travel expert will contact you within **24 hours** to:
• Confirm availability and final pricing
• Customize your itinerary if needed
• Complete your booking

Thank you for choosing Trip & Event! We're excited to help you plan your perfect trip.
    `.trim();

    return successResponse(
      ACTION_TYPES.CONFIRM_BOOKING,
      bookingMessage,
      {
        booking: {
          packageId: pkg.packageId,
          packageTitle: pkg.title,
          destination: context.destination,
          travelDate: context.travelDate,
          travelers: context.travelers,
          pricePerPerson: parseFloat(price),
          totalPrice,
          contact: context.contact
        },
        // Payment NOT required - travel expert will handle
        payment_required: false,
        expert_callback: true,
        status: 'pending_expert_contact'
      },
      context,
      "Is there anything else I can help you with?"
    );
  }

  /**
   * Handle FAQ
   */
  async handleFAQ(sessionId, entities, context) {
    // Simple FAQ responses
    const faqs = {
      included: "Most packages include accommodation, meals (as specified), transfers, and sightseeing. Check the package details for specifics.",
      payment: "We accept all major credit/debit cards, UPI, net banking, and wallet payments through Razorpay.",
      cancellation: "Cancellation policies vary by package. Generally, free cancellation up to 7 days before travel. Check package terms for details.",
      refund: "Refunds are processed within 5-7 business days to your original payment method."
    };

    const faqKey = Object.keys(faqs).find(key =>
      entities.faqTopic?.includes(key) || context.lastMessage?.includes(key)
    );

    if (faqKey) {
      return successResponse(
        ACTION_TYPES.SHOW_MESSAGE,
        faqs[faqKey],
        null,
        context,
        "Anything else I can help with?"
      );
    }

    return successResponse(
      ACTION_TYPES.SHOW_MESSAGE,
      "I can help you with:\n• What's included in packages\n• Payment options\n• Cancellation policy\n• Refund process\n\nWhat would you like to know?",
      null,
      context
    );
  }

  /**
   * Handle cancel/reset
   */
  async handleCancel(sessionId) {
    await this.conversationManager.resetSession(sessionId);
    return greetingMessage();
  }

  /**
   * Handle fallback (unrecognized intent)
   */
  async handleFallback(sessionId, context) {
    // Track fallback count in context
    const fallbackCount = (context.fallbackCount || 0) + 1;
    await this.conversationManager.updateContext(sessionId, { fallbackCount });

    // After 2 failed attempts, offer escape options
    if (fallbackCount >= 2) {
      const escapeQuickReplies = [
        { text: 'Talk to expert', value: 'I want to talk to an expert' },
        { text: 'Start over', value: 'Start fresh' },
        { text: 'Show packages', value: 'Show me packages' }
      ];

      return successResponse(
        ACTION_TYPES.SHOW_MESSAGE,
        "I'm having trouble understanding. Would you like to talk to a travel expert who can help you better?",
        {
          suggestions: escapeQuickReplies.map(r => r.text),
          quick_replies: escapeQuickReplies
        },
        context,
        "How would you like to proceed?"
      );
    }

    const nextStep = this.conversationManager.getMissingFields(context)[0];

    // Context-specific fallback messages
    const stepSpecificMessages = {
      'destination': "I didn't catch that. Which destination interests you? You can say a place name like 'Goa' or 'Manali'.",
      'travel_date': "I couldn't understand the date. When would you like to travel? Try saying '12 March' or 'next month'.",
      'travelers': "How many people will be traveling? You can say '2 adults' or '4 people'.",
      'name': "I need your name for the booking. Just type your full name (e.g., 'Raj Singh').",
      'email': "Please provide your email address (e.g., 'raj@example.com').",
      'phone': "What's your phone number? (e.g., '9876543210')"
    };

    if (nextStep && stepSpecificMessages[nextStep]) {
      return incompleteResponse(
        stepSpecificMessages[nextStep],
        [nextStep],
        context
      );
    }

    if (nextStep) {
      return incompleteResponse(
        `I'm not sure I understood that. ${getFieldPrompt(nextStep)}`,
        [nextStep],
        context
      );
    }

    const suggestions = [
      { text: 'Show packages', value: 'Show me packages' },
      { text: 'Talk to expert', value: 'I want to talk to an expert' },
      { text: 'Plan a trip', value: 'I want to plan a trip' }
    ];

    return successResponse(
      ACTION_TYPES.SHOW_MESSAGE,
      "I'm not sure I understood that. How can I help you with your travel plans?",
      {
        suggestions: suggestions.map(s => s.text),
        quick_replies: suggestions
      },
      context
    );
  }

  /**
   * Extract position from entities (first, second, 1, 2, etc.)
   */
  extractPosition(entities) {
    const positions = {
      first: 0, '1': 0, '1st': 0, one: 0,
      second: 1, '2': 1, '2nd': 1, two: 1,
      third: 2, '3': 2, '3rd': 2, three: 2,
      fourth: 3, '4': 3, '4th': 3, four: 3,
      fifth: 4, '5': 4, '5th': 4, five: 4
    };

    for (const [key, value] of Object.entries(positions)) {
      if (Object.values(entities).some(v => String(v).toLowerCase().includes(key))) {
        return value;
      }
    }

    return null;
  }

  /**
   * Get session info
   */
  async getSession(sessionId) {
    const session = await this.conversationManager.getOrCreateSession(sessionId);
    return {
      sessionId: session.id,
      context: this.conversationManager.getContext(session),
      messages: session.messages || []
    };
  }

  /**
   * Clear session
   */
  async clearSession(sessionId) {
    await this.conversationManager.deactivateSession(sessionId);
    return { success: true, message: 'Session cleared' };
  }
}

module.exports = new ChatbotService();
