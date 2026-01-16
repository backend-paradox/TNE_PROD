import React from 'react';
import { Check, MapPin, Users, CreditCard, CheckCircle } from 'lucide-react';
import { BookingStep } from '../../types';

interface BookingStepsProps {
  currentStep: BookingStep;
  completedSteps: BookingStep[];
  onStepClick?: (step: BookingStep) => void;
}

const steps: { id: BookingStep; label: string; icon: React.ReactNode }[] = [
  { id: 'select', label: 'Select Package', icon: <MapPin className="w-5 h-5" /> },
  { id: 'travelers', label: 'Traveler Details', icon: <Users className="w-5 h-5" /> },
  { id: 'review', label: 'Review', icon: <CheckCircle className="w-5 h-5" /> },
  { id: 'payment', label: 'Payment', icon: <CreditCard className="w-5 h-5" /> }
];

export function BookingSteps({ currentStep, completedSteps, onStepClick }: BookingStepsProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full">
      {/* Desktop Steps */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-teal-600 to-cyan-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || index < currentIndex;
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;
          const isClickable = isCompleted && onStepClick;

          return (
            <div 
              key={step.id}
              className={`relative flex flex-col items-center z-10 ${
                isClickable ? 'cursor-pointer' : ''
              }`}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              {/* Step Circle */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                ${isCompleted || isCurrent
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-500 text-white shadow-lg shadow-teal-200'
                  : 'bg-gray-100 text-gray-400'
                }
                ${isClickable ? 'hover:scale-110' : ''}
              `}>
                {isCompleted && !isCurrent ? (
                  <Check className="w-6 h-6" />
                ) : (
                  step.icon
                )}
              </div>

              {/* Step Label */}
              <span className={`
                mt-3 text-sm font-medium transition-colors
                ${isCurrent ? 'text-teal-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Steps */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            Step {currentIndex + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium text-teal-600">
            {steps[currentIndex]?.label}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-600 to-cyan-500 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id) || index < currentIndex;
            const isCurrent = step.id === currentStep;

            return (
              <div
                key={step.id}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                  ${isCurrent
                    ? 'bg-teal-100 text-teal-700'
                    : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                  }
                `}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                )}
                {step.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BookingSteps;
