import React, { useState } from 'react';
import { 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X,
  Shield,
  Clock,
  Users,
  Calendar
} from 'lucide-react';
import { Trip, TripDate, CustomOption, BookingPricing } from '../../types';
import { formatCurrency, formatDateRange, formatDuration } from '../../utils';

interface PriceSummaryProps {
  trip: Trip;
  selectedDate: TripDate | null;
  travelers: { adults: number; children: number; infants: number };
  selectedOptions: CustomOption[];
  pricing: BookingPricing;
  couponCode: string;
  couponDiscount: number;
  onApplyCoupon: (code: string) => { valid: boolean; message: string };
  onRemoveCoupon: () => void;
  showDetails?: boolean;
}

export function PriceSummary({
  trip,
  selectedDate,
  travelers,
  selectedOptions,
  pricing,
  couponCode,
  couponDiscount,
  onApplyCoupon,
  onRemoveCoupon,
  showDetails = true
}: PriceSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponMessage(null);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = onApplyCoupon(couponInput.trim());
    setCouponMessage({
      type: result.valid ? 'success' : 'error',
      text: result.message
    });
    
    if (result.valid) {
      setCouponInput('');
    }
    
    setIsApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    onRemoveCoupon();
    setCouponMessage(null);
    setCouponInput('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
      {/* Trip Info Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex gap-3">
          <img
            src={trip.thumbnail}
            alt={trip.title}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{trip.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(trip.duration.days, trip.duration.nights)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Details */}
      {selectedDate && (
        <div className="px-4 py-3 bg-teal-50 border-b border-teal-100">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span className="text-teal-800 font-medium">
              {formatDateRange(selectedDate.startDate, selectedDate.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <Users className="w-4 h-4 text-teal-600" />
            <span className="text-teal-700">
              {travelers.adults} Adult{travelers.adults > 1 ? 's' : ''}
              {travelers.children > 0 && `, ${travelers.children} Child${travelers.children > 1 ? 'ren' : ''}`}
              {travelers.infants > 0 && `, ${travelers.infants} Infant${travelers.infants > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full mb-4"
        >
          <span className="font-semibold text-gray-900">Price Breakdown</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isExpanded && showDetails && (
          <div className="space-y-3 mb-4">
            {pricing.adults > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Adult × {pricing.adults}
                </span>
                <span className="text-gray-900">
                  {formatCurrency(pricing.adultPrice * pricing.adults)}
                </span>
              </div>
            )}

            {pricing.children > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Child × {pricing.children}
                </span>
                <span className="text-gray-900">
                  {formatCurrency(pricing.childPrice * pricing.children)}
                </span>
              </div>
            )}

            {pricing.infants > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Infant × {pricing.infants}
                </span>
                <span className="text-gray-900">
                  {formatCurrency(pricing.infantPrice * pricing.infants)}
                </span>
              </div>
            )}

            {selectedOptions.length > 0 && (
              <>
                <div className="border-t border-gray-100 my-3" />
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Add-ons
                </div>
                {selectedOptions.map(option => (
                  <div key={option.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{option.name}</span>
                    <span className="text-gray-900">{formatCurrency(option.price)}</span>
                  </div>
                ))}
              </>
            )}

            <div className="border-t border-gray-100 my-3" />

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(pricing.subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (5%)</span>
              <span className="text-gray-900">{formatCurrency(pricing.taxes)}</span>
            </div>

            {pricing.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({couponCode})</span>
                <span>-{formatCurrency(pricing.discount)}</span>
              </div>
            )}
          </div>
        )}

        {/* Coupon Section */}
        {!couponCode ? (
          <div className="mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                disabled={!couponInput.trim() || isApplyingCoupon}
                className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isApplyingCoupon ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {couponMessage && (
              <p className={`text-xs mt-2 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {couponMessage.text}
              </p>
            )}
            <div className="mt-2 text-xs text-gray-500">
              Try: WELCOME10, SUMMER15, NEWYEAR25
            </div>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-between bg-green-50 px-3 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">{couponCode}</span>
              <span className="text-xs text-green-600">({couponDiscount}% off)</span>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="p-1 hover:bg-green-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-green-600" />
            </button>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center py-3 border-t border-gray-200">
          <span className="text-lg font-bold text-gray-900">Total Amount</span>
          <div className="text-right">
            {trip.price.originalPrice && (
              <div className="text-sm text-gray-400 line-through">
                {formatCurrency(trip.price.originalPrice * (pricing.adults + pricing.children * 0.7))}
              </div>
            )}
            <div className="text-2xl font-bold text-teal-600">
              {formatCurrency(pricing.total)}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 text-green-600" />
            <span>100% Secure Payment</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Free cancellation up to 15 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceSummary;
