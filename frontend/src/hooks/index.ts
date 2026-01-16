import { useState, useEffect, useRef, useCallback } from 'react';
import { Trip } from '../types';
import { enrichedTripsData } from '../data/trips';
import axiosInstance from '../app/axios';

// Search Hook with debouncing
export function useSearch(debounceMs: number = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Trip[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const searchTrips = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const filtered = enrichedTripsData.filter(trip =>
      trip.title.toLowerCase().includes(q) ||
      trip.destination.toLowerCase().includes(q) ||
      trip.country.toLowerCase().includes(q) ||
      trip.description.toLowerCase().includes(q) ||
      trip.tags?.some(tag => tag.toLowerCase().includes(q))
    );
    setResults(filtered);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setIsSearching(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchTrips(value);
      setIsSearching(false);
    }, debounceMs);
  }, [debounceMs, searchTrips]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    results,
    isSearching,
    handleSearch,
    clearSearch,
  };
}

// Live Search Hook - API-based search with debouncing and category filter
export type SearchCategory = 'all' | 'domestic' | 'international' | 'cinetrip';

export interface SearchResult {
  id: string;
  slug: string;
  name: string;
  destination?: string;
  state?: string;
  country?: string;
  price: number;
  image: string;
  duration: string;
  rating?: number;
  category?: string;
  type: 'tour' | 'cinetrip';
}

export function useLiveSearch(debounceMs: number = 300) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchPackages = useCallback(async (searchQuery: string, searchCategory: SearchCategory) => {
    if (!searchQuery.trim() && searchCategory === 'all') {
      setResults([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    setError(null);

    try {
      const combinedResults: SearchResult[] = [];

      if (searchCategory === 'cinetrip') {
        // Only search CineTrip
        const response = await axiosInstance.get('/cinetrip-packages/search', {
          params: { q: searchQuery, limit: 10 },
          signal: abortControllerRef.current.signal,
        });
        const cineTripResults = response.data.data.map((pkg: any) => ({
          id: pkg.id,
          slug: pkg.slug,
          name: pkg.name,
          price: Number(pkg.price),
          image: pkg.image,
          duration: pkg.duration,
          category: pkg.category,
          rating: pkg.rating,
          type: 'cinetrip' as const,
        }));
        combinedResults.push(...cineTripResults);
      } else if (searchCategory === 'all') {
        // Search both tour packages and CineTrip
        const [tourResponse, cineTripResponse] = await Promise.all([
          axiosInstance.get('/tour-packages/search', {
            params: { q: searchQuery, limit: 6 },
            signal: abortControllerRef.current.signal,
          }),
          axiosInstance.get('/cinetrip-packages/search', {
            params: { q: searchQuery, limit: 4 },
            signal: abortControllerRef.current.signal,
          }),
        ]);

        const tourResults = tourResponse.data.data.map((pkg: any) => ({
          id: pkg.id,
          slug: pkg.slug,
          name: pkg.name,
          destination: pkg.destination,
          state: pkg.state,
          country: pkg.country,
          price: Number(pkg.startingPrice),
          image: pkg.imageUrl,
          duration: pkg.duration,
          rating: pkg.rating,
          type: 'tour' as const,
        }));

        const cineTripResults = cineTripResponse.data.data.map((pkg: any) => ({
          id: pkg.id,
          slug: pkg.slug,
          name: pkg.name,
          price: Number(pkg.price),
          image: pkg.image,
          duration: pkg.duration,
          category: pkg.category,
          rating: pkg.rating,
          type: 'cinetrip' as const,
        }));

        combinedResults.push(...tourResults, ...cineTripResults);
      } else {
        // Search tour packages with category filter (domestic/international)
        const response = await axiosInstance.get('/tour-packages/search', {
          params: { q: searchQuery, category: searchCategory, limit: 10 },
          signal: abortControllerRef.current.signal,
        });
        const tourResults = response.data.data.map((pkg: any) => ({
          id: pkg.id,
          slug: pkg.slug,
          name: pkg.name,
          destination: pkg.destination,
          state: pkg.state,
          country: pkg.country,
          price: Number(pkg.startingPrice),
          image: pkg.imageUrl,
          duration: pkg.duration,
          rating: pkg.rating,
          type: 'tour' as const,
        }));
        combinedResults.push(...tourResults);
      }

      setResults(combinedResults);
    } catch (err: any) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        setError('Failed to search packages');
        console.error('Search error:', err);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchPackages(value, category);
    }, debounceMs);
  }, [debounceMs, category, searchPackages]);

  const handleCategoryChange = useCallback((newCategory: SearchCategory) => {
    setCategory(newCategory);
    // Trigger new search with existing query
    if (query.trim()) {
      searchPackages(query, newCategory);
    }
  }, [query, searchPackages]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    category,
    results,
    isSearching,
    error,
    handleSearch,
    handleCategoryChange,
    clearSearch,
  };
}

// Wishlist Hook with API and localStorage persistence
export interface WishlistItem {
  id: number;
  packageId: string;
  type: 'tour' | 'cinetrip';
  name: string;
  slug: string;
  image?: string;
  price: number;
  duration?: string;
  destination?: string;
  createdAt: string;
}

const WISHLIST_KEY = 'travel-wishlist';
const WISHLIST_ITEMS_KEY = 'travel-wishlist-items';

function getStoredWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredWishlist(items: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

function getStoredWishlistItems(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WISHLIST_ITEMS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredWishlistItems(items: WishlistItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_ITEMS_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

function isLoggedIn(): boolean {
  return !!localStorage.getItem('accessToken');
}

export function useWishlist(): {
  wishlist: string[];
  wishlistItems: WishlistItem[];
  loading: boolean;
  isSaved: (id: string) => boolean;
  toggleSave: (id: string, itemData?: Partial<WishlistItem>) => Promise<void>;
  addToWishlist: (id: string, itemData?: Partial<WishlistItem>) => Promise<void>;
  removeFromWishlist: (id: string, type?: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  savedTrips: Trip[];
  fetchWishlist: () => Promise<void>;
  syncWishlistToBackend: () => Promise<void>;
} {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn()) {
      setWishlist(getStoredWishlist());
      setWishlistItems(getStoredWishlistItems());
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get('/wishlist');
      const data = response.data.data;
      setWishlistItems(data.items || []);
      setWishlist((data.items || []).map((item: WishlistItem) => item.packageId));
      setSynced(true);
    } catch (error: any) {
      // If 401, tokens are expired/invalid - fallback to localStorage silently
      // Don't throw or show error on public pages
      if (error?.response?.status === 401) {
        console.log('Wishlist: Auth expired, using local storage');
      } else {
        console.error('Failed to fetch wishlist:', error);
      }

      // Always fallback to local storage on error
      setWishlist(getStoredWishlist());
      setWishlistItems(getStoredWishlistItems());
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync local wishlist to backend after login
  const syncWishlistToBackend = useCallback(async () => {
    if (!isLoggedIn()) return;

    const localWishlist = getStoredWishlist();
    const localItems = getStoredWishlistItems();

    if (localWishlist.length === 0) {
      await fetchWishlist();
      return;
    }

    setLoading(true);
    try {
      // Add local items to backend
      for (const id of localWishlist) {
        const itemData = localItems.find(item => item.packageId === id);
        await axiosInstance.post('/wishlist', {
          packageId: id,
          type: itemData?.type || 'tour',
          name: itemData?.name || 'Unknown Package',
          slug: itemData?.slug || id,
          image: itemData?.image,
          price: itemData?.price || 0,
          duration: itemData?.duration,
          destination: itemData?.destination,
        });
      }

      // Clear local storage
      localStorage.removeItem(WISHLIST_KEY);
      localStorage.removeItem(WISHLIST_ITEMS_KEY);

      // Fetch merged wishlist
      await fetchWishlist();
    } catch (error) {
      console.error('Failed to sync wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchWishlist]);

  // Load wishlist on mount
  useEffect(() => {
    if (isLoggedIn() && !synced) {
      fetchWishlist();
    } else if (!isLoggedIn()) {
      setWishlist(getStoredWishlist());
      setWishlistItems(getStoredWishlistItems());
    }
  }, [fetchWishlist, synced]);

  // Cross-tab synchronization - listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only update if the wishlist keys changed
      if (e.key === WISHLIST_KEY || e.key === WISHLIST_ITEMS_KEY) {
        setWishlist(getStoredWishlist());
        setWishlistItems(getStoredWishlistItems());
      }

      // If all storage was cleared
      if (e.key === null) {
        setWishlist([]);
        setWishlistItems([]);
      }
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const isSaved = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const toggleSave = useCallback(async (id: string, itemData?: Partial<WishlistItem>) => {
    const wasSaved = wishlist.includes(id);

    // Helper function for local storage operations
    const toggleLocal = () => {
      if (wasSaved) {
        setWishlist(prev => {
          const newList = prev.filter(item => item !== id);
          setStoredWishlist(newList);
          return newList;
        });
        setWishlistItems(prev => {
          const newItems = prev.filter(item => item.packageId !== id);
          setStoredWishlistItems(newItems);
          return newItems;
        });
      } else {
        setWishlist(prev => {
          const newList = [...prev, id];
          setStoredWishlist(newList);
          return newList;
        });
        if (itemData) {
          setWishlistItems(prev => {
            const newItem: WishlistItem = {
              id: Date.now(),
              packageId: id,
              type: itemData.type || 'tour',
              name: itemData.name || 'Unknown Package',
              slug: itemData.slug || id,
              image: itemData.image,
              price: itemData.price || 0,
              duration: itemData.duration,
              destination: itemData.destination,
              createdAt: new Date().toISOString(),
            };
            const newItems = [...prev, newItem];
            setStoredWishlistItems(newItems);
            return newItems;
          });
        }
      }
    };

    if (isLoggedIn()) {
      setLoading(true);
      try {
        const response = await axiosInstance.post('/wishlist/toggle', {
          packageId: id,
          type: itemData?.type || 'tour',
          name: itemData?.name || 'Unknown Package',
          slug: itemData?.slug || id,
          image: itemData?.image,
          price: itemData?.price || 0,
          duration: itemData?.duration,
          destination: itemData?.destination,
        });

        const result = response.data.data;
        if (result.action === 'added') {
          setWishlist(prev => [...prev, id]);
          if (result.item) {
            setWishlistItems(prev => [...prev, result.item]);
          }
        } else {
          setWishlist(prev => prev.filter(item => item !== id));
          setWishlistItems(prev => prev.filter(item => item.packageId !== id));
        }
      } catch (error) {
        // Fallback to local storage when API fails
        console.warn('Wishlist API unavailable, using local storage');
        toggleLocal();
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage only
      toggleLocal();
    }
  }, [wishlist]);

  const addToWishlist = useCallback(async (id: string, itemData?: Partial<WishlistItem>) => {
    if (wishlist.includes(id)) return;

    if (isLoggedIn()) {
      setLoading(true);
      try {
        const response = await axiosInstance.post('/wishlist', {
          packageId: id,
          type: itemData?.type || 'tour',
          name: itemData?.name || 'Unknown Package',
          slug: itemData?.slug || id,
          image: itemData?.image,
          price: itemData?.price || 0,
          duration: itemData?.duration,
          destination: itemData?.destination,
        });

        const newItem = response.data.data;
        setWishlist(prev => [...prev, id]);
        setWishlistItems(prev => [...prev, newItem]);
      } catch (error) {
        console.error('Failed to add to wishlist:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage only
      setWishlist(prev => {
        const newList = [...prev, id];
        setStoredWishlist(newList);
        return newList;
      });
      if (itemData) {
        setWishlistItems(prev => {
          const newItem: WishlistItem = {
            id: Date.now(),
            packageId: id,
            type: itemData.type || 'tour',
            name: itemData.name || 'Unknown Package',
            slug: itemData.slug || id,
            image: itemData.image,
            price: itemData.price || 0,
            duration: itemData.duration,
            destination: itemData.destination,
            createdAt: new Date().toISOString(),
          };
          const newItems = [...prev, newItem];
          setStoredWishlistItems(newItems);
          return newItems;
        });
      }
    }
  }, [wishlist]);

  const removeFromWishlist = useCallback(async (id: string, type: string = 'tour') => {
    // Optimistic update - save current state for rollback
    const previousWishlist = [...wishlist];
    const previousWishlistItems = [...wishlistItems];

    // Update UI immediately (optimistic)
    setWishlist(prev => prev.filter(item => item !== id));
    setWishlistItems(prev => prev.filter(item => item.packageId !== id));

    if (isLoggedIn()) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/wishlist/${id}?type=${type}`);

        // Update localStorage as well for sync
        const newWishlist = previousWishlist.filter(item => item !== id);
        const newWishlistItems = previousWishlistItems.filter(item => item.packageId !== id);
        setStoredWishlist(newWishlist);
        setStoredWishlistItems(newWishlistItems);
      } catch (error: any) {
        console.error('Failed to remove from wishlist:', error);

        // Rollback optimistic update
        setWishlist(previousWishlist);
        setWishlistItems(previousWishlistItems);

        // Fallback to localStorage on network error
        if (error?.code === 'ERR_NETWORK' || error?.message?.toLowerCase().includes('network')) {
          const newWishlist = previousWishlist.filter(item => item !== id);
          const newWishlistItems = previousWishlistItems.filter(item => item.packageId !== id);
          setStoredWishlist(newWishlist);
          setStoredWishlistItems(newWishlistItems);
          setWishlist(newWishlist);
          setWishlistItems(newWishlistItems);
        }

        throw error; // Re-throw for caller to handle
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage only
      const newWishlist = previousWishlist.filter(item => item !== id);
      const newWishlistItems = previousWishlistItems.filter(item => item.packageId !== id);
      setStoredWishlist(newWishlist);
      setStoredWishlistItems(newWishlistItems);
    }
  }, [wishlist, wishlistItems]);

  const clearWishlist = useCallback(async () => {
    // Optimistic update - save current state for rollback
    const previousWishlist = [...wishlist];
    const previousWishlistItems = [...wishlistItems];

    // Update UI immediately (optimistic)
    setWishlist([]);
    setWishlistItems([]);

    if (isLoggedIn()) {
      setLoading(true);
      try {
        await axiosInstance.delete('/wishlist');

        // Clear localStorage as well for sync
        localStorage.removeItem(WISHLIST_KEY);
        localStorage.removeItem(WISHLIST_ITEMS_KEY);
      } catch (error: any) {
        console.error('Failed to clear wishlist:', error);

        // Rollback optimistic update
        setWishlist(previousWishlist);
        setWishlistItems(previousWishlistItems);

        // Fallback to localStorage on network error
        if (error?.code === 'ERR_NETWORK' || error?.message?.toLowerCase().includes('network')) {
          localStorage.removeItem(WISHLIST_KEY);
          localStorage.removeItem(WISHLIST_ITEMS_KEY);
          setWishlist([]);
          setWishlistItems([]);
        }

        throw error; // Re-throw for caller to handle
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage only
      localStorage.removeItem(WISHLIST_KEY);
      localStorage.removeItem(WISHLIST_ITEMS_KEY);
    }
  }, [wishlist, wishlistItems]);

  const savedTrips = enrichedTripsData.filter(trip => wishlist.includes(trip.id));

  return {
    wishlist,
    wishlistItems,
    loading,
    isSaved,
    toggleSave,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    savedTrips,
    fetchWishlist,
    syncWishlistToBackend,
  };
}

// Click Outside Hook
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Debounce Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Local Storage Hook
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

// Media Query Hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Scroll Lock Hook
export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (lock) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [lock]);
}

// Intersection Observer Hook
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref?.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}
