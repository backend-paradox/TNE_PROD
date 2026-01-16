import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ChevronDown,
  AlertCircle,
  Trash2,
  Plus
} from 'lucide-react';
import { Traveler } from '../../types';
import { generateId, validateEmail, validatePhone } from '../../utils';

interface TravelerFormProps {
  travelers: Traveler[];
  travelerCounts: { adults: number; children: number; infants: number };
  onChange: (travelers: Traveler[]) => void;
  errors?: Record<string, string>;
}

const idTypes = [
  { value: 'aadhar', label: 'Aadhaar Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'voter_id', label: 'Voter ID' }
];

const nationalities = [
  'Indian', 'American', 'British', 'Canadian', 'Australian', 'German', 'French', 'Other'
];

export function TravelerForm({ travelers, travelerCounts, onChange, errors = {} }: TravelerFormProps) {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const totalTravelers = travelerCounts.adults + travelerCounts.children + travelerCounts.infants;

  // Initialize travelers if empty
  React.useEffect(() => {
    if (travelers.length === 0 && totalTravelers > 0) {
      const newTravelers: Traveler[] = [];
      
      // Add adults
      for (let i = 0; i < travelerCounts.adults; i++) {
        newTravelers.push(createEmptyTraveler('adult', i + 1));
      }
      
      // Add children
      for (let i = 0; i < travelerCounts.children; i++) {
        newTravelers.push(createEmptyTraveler('child', i + 1));
      }
      
      // Add infants
      for (let i = 0; i < travelerCounts.infants; i++) {
        newTravelers.push(createEmptyTraveler('infant', i + 1));
      }
      
      onChange(newTravelers);
    }
  }, [totalTravelers]);

  const createEmptyTraveler = (type: 'adult' | 'child' | 'infant', index: number): Traveler => ({
    id: generateId('traveler'),
    type,
    firstName: '',
    lastName: '',
    email: type === 'adult' && index === 1 ? '' : undefined,
    phone: type === 'adult' && index === 1 ? '' : undefined,
    dateOfBirth: '',
    gender: 'male',
    nationality: 'Indian',
    idType: 'aadhar',
    idNumber: ''
  });

  const updateTraveler = (index: number, field: keyof Traveler, value: any) => {
    const updated = [...travelers];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const getTravelerLabel = (traveler: Traveler, index: number): string => {
    const typeLabels = { adult: 'Adult', child: 'Child', infant: 'Infant' };
    const typeCount = travelers.slice(0, index + 1).filter(t => t.type === traveler.type).length;
    return `${typeLabels[traveler.type]} ${typeCount}`;
  };

  const getMaxDate = (type: 'adult' | 'child' | 'infant'): string => {
    const today = new Date();
    if (type === 'adult') {
      today.setFullYear(today.getFullYear() - 12);
    } else if (type === 'child') {
      today.setFullYear(today.getFullYear() - 2);
    }
    return today.toISOString().split('T')[0];
  };

  const getMinDate = (type: 'adult' | 'child' | 'infant'): string => {
    const today = new Date();
    if (type === 'child') {
      today.setFullYear(today.getFullYear() - 12);
    } else if (type === 'infant') {
      today.setFullYear(today.getFullYear() - 2);
    } else {
      today.setFullYear(today.getFullYear() - 100);
    }
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Traveler Details</h2>
        <span className="text-sm text-gray-500">
          {travelers.filter(t => t.firstName && t.lastName).length} of {totalTravelers} completed
        </span>
      </div>

      {travelers.map((traveler, index) => {
        const isExpanded = expandedIndex === index;
        const isPrimary = index === 0;
        const hasErrors = Object.keys(errors).some(key => key.startsWith(`traveler_${index}`));
        const isComplete = traveler.firstName && traveler.lastName && traveler.dateOfBirth && traveler.idNumber;

        return (
          <div 
            key={traveler.id}
            className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${
              isExpanded
                ? 'border-teal-500 shadow-lg shadow-teal-100'
                : hasErrors
                  ? 'border-red-300'
                  : isComplete
                    ? 'border-green-300'
                    : 'border-gray-200'
            }`}
          >
            {/* Header */}
            <button
              onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {traveler.firstName && traveler.lastName 
                        ? `${traveler.firstName} ${traveler.lastName}`
                        : getTravelerLabel(traveler, index)
                      }
                    </span>
                    {isPrimary && (
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 capitalize">{traveler.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasErrors && <AlertCircle className="w-5 h-5 text-red-500" />}
                {isComplete && !hasErrors && (
                  <span className="text-green-600 text-sm font-medium">Complete</span>
                )}
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Form Fields */}
            {isExpanded && (
              <div className="px-4 pb-6 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={traveler.firstName}
                      onChange={(e) => updateTraveler(index, 'firstName', e.target.value)}
                      placeholder="As per ID proof"
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${
                        errors[`traveler_${index}_firstName`]
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                      }`}
                    />
                    {errors[`traveler_${index}_firstName`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`traveler_${index}_firstName`]}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={traveler.lastName}
                      onChange={(e) => updateTraveler(index, 'lastName', e.target.value)}
                      placeholder="As per ID proof"
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${
                        errors[`traveler_${index}_lastName`]
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                      }`}
                    />
                  </div>

                  {/* Email (only for primary adult) */}
                  {isPrimary && traveler.type === 'adult' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={traveler.email || ''}
                          onChange={(e) => updateTraveler(index, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Phone (only for primary adult) */}
                  {isPrimary && traveler.type === 'adult' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={traveler.phone || ''}
                          onChange={(e) => updateTraveler(index, 'phone', e.target.value)}
                          placeholder="+91 900 700 0777"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={traveler.dateOfBirth}
                        onChange={(e) => updateTraveler(index, 'dateOfBirth', e.target.value)}
                        max={getMaxDate(traveler.type)}
                        min={getMinDate(traveler.type)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {['male', 'female', 'other'].map(gender => (
                        <button
                          key={gender}
                          type="button"
                          onClick={() => updateTraveler(index, 'gender', gender)}
                          className={`flex-1 py-3 rounded-xl border-2 font-medium capitalize transition-all ${
                            traveler.gender === gender
                              ? 'border-teal-500 bg-teal-50 text-teal-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {gender}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={traveler.nationality}
                      onChange={(e) => updateTraveler(index, 'nationality', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-white"
                    >
                      {nationalities.map(nat => (
                        <option key={nat} value={nat}>{nat}</option>
                      ))}
                    </select>
                  </div>

                  {/* ID Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      ID Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={traveler.idType}
                      onChange={(e) => updateTraveler(index, 'idType', e.target.value as any)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-white"
                    >
                      {idTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* ID Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      ID Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={traveler.idNumber}
                      onChange={(e) => updateTraveler(index, 'idNumber', e.target.value)}
                      placeholder="Enter ID number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                    />
                  </div>

                  {/* Special Requirements */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Special Requirements (Optional)
                    </label>
                    <textarea
                      value={traveler.specialRequirements || ''}
                      onChange={(e) => updateTraveler(index, 'specialRequirements', e.target.value)}
                      placeholder="Any dietary restrictions, medical conditions, accessibility needs..."
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Info Box */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-teal-800">
          <p className="font-medium mb-1">Important</p>
          <p>Please enter names exactly as they appear on your ID proof. This information will be used for booking confirmation and cannot be changed later.</p>
        </div>
      </div>
    </div>
  );
}

export default TravelerForm;
