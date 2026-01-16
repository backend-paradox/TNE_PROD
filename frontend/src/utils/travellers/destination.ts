export const normalizeDestination = (destination?: string | null): string => {
  const value = (destination || '').trim();
  if (!value) return '';
  const lowered = value.toLowerCase();
  if (lowered.includes('to be decided') || lowered.includes('decided by vote')) {
    return '';
  }
  if (lowered === 'tbd' || lowered === 'destination tbd') {
    return '';
  }
  return value;
};
