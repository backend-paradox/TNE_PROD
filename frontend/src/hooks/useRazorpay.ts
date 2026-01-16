import { useEffect, useState } from 'react';

// Razorpay interface
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    // If not loaded via script tag, load dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      setIsLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const openRazorpay = (options: RazorpayOptions) => {
    if (!isLoaded || !window.Razorpay) {
      console.error('Razorpay SDK not loaded');
      return;
    }

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return { isLoaded, openRazorpay };
}
