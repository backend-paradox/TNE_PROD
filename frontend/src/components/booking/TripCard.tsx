import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Clock,
  MapPin,
  Heart,
  Users,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Trip } from '../../types';
import { formatCurrency, formatDuration } from '../../utils';
import { useWishlist } from '../../hooks';
import { LazyImage } from '../ui/LazyImage';

interface TripCardProps {
  trip: Trip;
  variant?: 'default' | 'compact' | 'horizontal';
  className?: string;
}

// Fallback image for when images fail to load
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop';

export function TripCard({ trip, variant = 'default', className = '' }: TripCardProps) {
  const { isSaved, toggleSave } = useWishlist();
  const saved = isSaved(trip.id);
  const [imageError, setImageError] = useState(false);
  const hasRating = Number.isFinite(trip.rating);
  const hasReviews = Number.isFinite(trip.reviewCount);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(trip.id);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const imageUrl = imageError ? FALLBACK_IMAGE : trip.thumbnail;

  // Horizontal variant for list view
  if (variant === 'horizontal') {
    return (
      <Link 
        to={`/trip/${trip.slug}`}
        className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row border border-gray-100 ${className}`}
      >
        {/* Image Container - Fixed aspect ratio */}
        <div className="relative w-full md:w-72 lg:w-80 flex-shrink-0">
          <div className="aspect-[4/3] md:aspect-auto md:h-full overflow-hidden">
            <LazyImage
              src={imageUrl}
              alt={trip.title}
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          {/* Badges */}
          {trip.price.discount && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-teal-600 to-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
              {trip.price.discount}% OFF
            </div>
          )}
          
          <button
            onClick={handleSaveClick}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
              saved
                ? 'bg-teal-500 text-white'
                : 'bg-white/95 text-gray-600 hover:bg-teal-500 hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between">
          <div>
            {/* Header with rating */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{trip.destination}, {trip.country}</span>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                  {trip.title}
                </h3>
              </div>
              {hasRating && (
                <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1.5 rounded-lg flex-shrink-0">
                  <Star className="w-4 h-4 text-green-600 fill-green-600" />
                  <span className="font-bold text-green-700">{trip.rating}</span>
                  {hasReviews && (
                    <span className="text-xs text-green-600 hidden sm:inline">({trip.reviewCount})</span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {trip.shortDescription || trip.description}
            </p>

            {/* Meta tags */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(trip.duration.days, trip.duration.nights)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-medium">
                <Users className="w-3.5 h-3.5" />
                Max {trip.maxGroupSize}
              </span>
              {trip.featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                  <Zap className="w-3.5 h-3.5" />
                  Popular
                </span>
              )}
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
            <div>
              {trip.price.originalPrice && (
                <span className="text-gray-400 line-through text-sm block">
                  {formatCurrency(trip.price.originalPrice)}
                </span>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(trip.price.adult)}
                </span>
                <span className="text-gray-500 text-sm">/person</span>
              </div>
            </div>
            <span className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-xl font-semibold group-hover:shadow-lg transition-all">
              View Details
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Link 
        to={`/trip/${trip.slug}`}
        className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 ${className}`}
      >
        <div className="aspect-[4/3] overflow-hidden">
          <LazyImage
            src={imageUrl}
            alt={trip.title}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-teal-600 transition-colors">
            {trip.title}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
            <MapPin className="w-3 h-3" />
            <span>{trip.destination}</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-teal-600 font-bold">
              {formatCurrency(trip.price.adult)}
            </span>
            <span className="text-gray-500 text-xs">
              {formatDuration(trip.duration.days, trip.duration.nights)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Default card variant
  return (
    <Link 
      to={`/trip/${trip.slug}`}
      className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full ${className}`}
    >
      {/* Image Section - Fixed aspect ratio */}
      <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
        <LazyImage
          src={imageUrl}
          alt={trip.title}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        
        {/* Discount Badge */}
        {trip.price.discount && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-teal-600 to-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
            {trip.price.discount}% OFF
          </div>
        )}
        
        {/* Save Button */}
        <button
          onClick={handleSaveClick}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
            saved
              ? 'bg-teal-500 text-white scale-110'
              : 'bg-white/95 text-gray-600 hover:bg-teal-500 hover:text-white hover:scale-110'
          }`}
        >
          <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
        </button>
        
        {/* Duration Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
          <Clock className="w-4 h-4 text-gray-700" />
          <span className="text-sm font-semibold text-gray-800">
            {formatDuration(trip.duration.days, trip.duration.nights)}
          </span>
        </div>

        {/* Rating Badge */}
        {hasRating && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-gray-800">{trip.rating}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{trip.destination}, {trip.country}</span>
        </div>

        {/* Title - Fixed height for consistency */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 mb-3 min-h-[3.25rem]">
          {trip.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(trip.tripType || []).slice(0, 3).map(tag => (
            <span 
              key={tag}
              className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Spacer to push price to bottom */}
        <div className="flex-grow" />

        {/* Price Section */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-100 mt-auto">
          <div>
            <span className="text-xs text-gray-500 block mb-0.5">Starting from</span>
            <div className="flex items-baseline gap-2">
              {trip.price.originalPrice && (
                <span className="text-gray-400 line-through text-sm">
                  {formatCurrency(trip.price.originalPrice)}
                </span>
              )}
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(trip.price.adult)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-teal-600 font-semibold text-sm group-hover:gap-2 transition-all">
            <span>View</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default TripCard;
