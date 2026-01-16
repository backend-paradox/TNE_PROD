import { format, parseISO } from 'date-fns';
export { getMediaUrl } from './media';
export * from './accessibility';
import { getScrollBehavior } from './accessibility';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date, formatString: string = 'dd MMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone.replace(/\s/g, ''));
};

export const getInitials = (name: string): string => {
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
};

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const formatDuration = (days: number, nights: number): string => `${days}D/${nights}N`;

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Domestic: 'bg-green-100 text-green-700',
    International: 'bg-blue-100 text-blue-700',
    Beach: 'bg-cyan-100 text-cyan-700',
    Mountain: 'bg-slate-100 text-slate-700',
    Adventure: 'bg-orange-100 text-orange-700',
    Honeymoon: 'bg-pink-100 text-pink-700',
    Family: 'bg-purple-100 text-purple-700',
    Luxury: 'bg-amber-100 text-amber-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

export const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: getScrollBehavior() });
};

export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
