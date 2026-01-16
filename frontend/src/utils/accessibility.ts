/**
 * Accessibility utilities for respecting user preferences
 */

/**
 * Check if user prefers reduced motion
 * @returns true if user prefers reduced motion, false otherwise
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Get scroll behavior based on user's motion preferences
 * @returns 'smooth' if user allows motion, 'auto' if user prefers reduced motion
 */
export function getScrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

/**
 * Scroll to an element with respect to user's motion preferences
 * @param element - The element to scroll to
 * @param options - ScrollIntoViewOptions (behavior will be overridden based on user preference)
 */
export function scrollIntoViewSafely(
  element: Element,
  options?: ScrollIntoViewOptions
): void {
  const behavior = getScrollBehavior();
  element.scrollIntoView({
    ...options,
    behavior,
  });
}

/**
 * Scroll window to position with respect to user's motion preferences
 * @param options - ScrollToOptions (behavior will be overridden based on user preference)
 */
export function scrollToSafely(options: ScrollToOptions): void {
  const behavior = getScrollBehavior();
  window.scrollTo({
    ...options,
    behavior,
  });
}

/**
 * Get animation duration based on user's motion preferences
 * @param normalDuration - Duration in milliseconds when motion is allowed
 * @param reducedDuration - Duration in milliseconds when motion is reduced (default: 0)
 * @returns Duration to use based on user preference
 */
export function getAnimationDuration(
  normalDuration: number,
  reducedDuration: number = 0
): number {
  return prefersReducedMotion() ? reducedDuration : normalDuration;
}

/**
 * Hook-friendly function to get scroll behavior with reactive updates
 * @param callback - Function to call when motion preference changes
 */
export function watchMotionPreference(callback: (prefersReduced: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  mediaQuery.addEventListener('change', handleChange);

  // Return cleanup function
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}
