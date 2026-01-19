import axiosInstance from '../../app/axios';
import { API_ENDPOINTS, APP_CONFIG } from '../../utils/constants';

// ============================================
// PAYMENT ORDERS
// ============================================

// Create payment order
export const createPaymentOrderAPI = async (orderData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.PAYMENT_ORDER, orderData);
  return response.data.data;
};

// Verify payment (after Razorpay callback)
export const verifyPaymentAPI = async (paymentData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.PAYMENT_VERIFY, paymentData);
  return response.data.data;
};

// Handle payment failure
export const handlePaymentFailureAPI = async (failureData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.PAYMENT_FAILURE, failureData);
  return response.data;
};

// ============================================
// PAYMENT QUERIES
// ============================================

// Get payment by ID
export const getPaymentByIdAPI = async (paymentId) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.PAYMENTS}/${paymentId}`);
  return response.data.data;
};

// Get payment by order ID
export const getPaymentByOrderIdAPI = async (orderId) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.PAYMENTS}/order/${orderId}`);
  return response.data.data;
};

// Get payments for a booking
export const getPaymentsByBookingIdAPI = async (bookingId) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.PAYMENTS}/booking/${bookingId}`);
  return response.data.data;
};

// Get user's payment history
export const getPaymentHistoryAPI = async (page = 1, limit = 20) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS, {
    params: { page, limit },
  });
  return response.data.data;
};

// ============================================
// REFUNDS
// ============================================

// Initiate refund
export const initiateRefundAPI = async (paymentId, refundData) => {
  const response = await axiosInstance.post(`${API_ENDPOINTS.PAYMENTS}/${paymentId}/refund`, refundData);
  return response.data.data;
};

// Get refunds for a payment
export const getPaymentRefundsAPI = async (paymentId) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.PAYMENTS}/${paymentId}/refunds`);
  return response.data.data;
};

// ============================================
// RAZORPAY INTEGRATION HELPER
// ============================================

/**
 * Initialize and open Razorpay payment modal
 * @param {Object} options - Payment options
 * @param {string} options.orderId - Razorpay order ID
 * @param {number} options.amount - Amount in paise
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.name - Business name
 * @param {string} options.description - Payment description
 * @param {Object} options.prefill - User prefill data (email, contact, name)
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onFailure - Failure callback
 * @param {Object} options.notes - Additional notes
 */
export const initializeRazorpayPayment = async (options) => {
  const {
    orderId,
    amount,
    currency = 'INR',
    name = 'TripAndEvent',
    description = 'Booking Payment',
    prefill = {},
    onSuccess,
    onFailure,
    notes = {},
  } = options;

  return new Promise((resolve, reject) => {
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      const error = new Error('Razorpay SDK not loaded. Please add Razorpay script to your HTML.');
      if (onFailure) onFailure(error);
      reject(error);
      return;
    }

    const razorpayOptions = {
      key: APP_CONFIG.RAZORPAY_KEY,
      amount,
      currency,
      name,
      description,
      order_id: orderId,
      notes,
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: prefill.contact || '',
      },
      theme: {
        color: '#3B82F6', // Tailwind blue-500
      },
      handler: async (response) => {
        try {
          // Verify payment with backend
          const verificationResult = await verifyPaymentAPI({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (onSuccess) onSuccess(verificationResult);
          resolve(verificationResult);
        } catch (error) {
          if (onFailure) onFailure(error);
          reject(error);
        }
      },
      modal: {
        ondismiss: () => {
          const error = new Error('Payment cancelled by user');
          error.code = 'PAYMENT_CANCELLED';
          if (onFailure) onFailure(error);
          reject(error);
        },
      },
    };

    const razorpay = new window.Razorpay(razorpayOptions);

    razorpay.on('payment.failed', async (response) => {
      try {
        // Report failure to backend
        await handlePaymentFailureAPI({
          razorpayOrderId: orderId,
          errorCode: response.error?.code,
          errorDescription: response.error?.description,
        });
      } catch (e) {
        console.error('Failed to report payment failure:', e);
      }

      const error = new Error(response.error.description || 'Payment failed');
      error.code = response.error.code;
      error.reason = response.error.reason;
      if (onFailure) onFailure(error);
      reject(error);
    });

    razorpay.open();
  });
};

// ============================================
// COMPLETE PAYMENT FLOW HELPER
// ============================================

/**
 * Complete payment flow: create order -> open Razorpay -> verify payment
 * @param {Object} bookingDetails - Booking details
 * @param {number} bookingDetails.bookingId - Booking ID
 * @param {number} bookingDetails.amount - Amount in INR (will be converted to paise)
 * @param {Object} bookingDetails.user - User details for prefill
 * @param {Object} bookingDetails.notes - Additional notes
 * @returns {Promise} - Resolves with verified payment data
 */
export const processPaymentAPI = async (bookingDetails) => {
  const { bookingId, amount, user = {}, notes = {} } = bookingDetails;

  // Step 1: Create order
  const order = await createPaymentOrderAPI({
    bookingId,
    amount: Number(amount),
    currency: 'INR',
    notes,
  });

  const amountInPaise = order.razorpayOrderAmount || Math.round(Number(order.amount) * 100);

  // Step 2: Open Razorpay and process payment
  const paymentResult = await initializeRazorpayPayment({
    orderId: order.razorpayOrderId,
    amount: amountInPaise,
    currency: order.currency,
    description: `Booking #${bookingId}`,
    prefill: {
      name: user.name,
      email: user.email,
      contact: user.phone,
    },
    notes,
  });

  return paymentResult;
};

// ============================================
// LOAD RAZORPAY SCRIPT HELPER
// ============================================

/**
 * Dynamically load Razorpay script
 * @returns {Promise} - Resolves when script is loaded
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
};
