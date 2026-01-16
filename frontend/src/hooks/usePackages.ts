import { useState, useEffect, useCallback } from 'react';
import {
  tourPackagesAPI,
  cineTripPackagesAPI,
  TourPackage,
  CineTripPackage,
} from '@/services/packageService';

interface UsePackagesState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSinglePackageState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ==================== TOUR PACKAGES HOOKS ====================

/**
 * Hook for fetching trending tour packages
 */
export function useTrendingPackages(limit: number = 4): UsePackagesState<TourPackage> {
  const [data, setData] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const packages = await tourPackagesAPI.getTrending(limit);
      setData(packages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trending packages');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching domestic tour packages
 */
export function useDomesticPackages(limit?: number): UsePackagesState<TourPackage> {
  const [data, setData] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const packages = await tourPackagesAPI.getDomestic(limit);
      setData(packages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch domestic packages');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching international tour packages
 */
export function useInternationalPackages(limit?: number): UsePackagesState<TourPackage> {
  const [data, setData] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const packages = await tourPackagesAPI.getInternational(limit);
      setData(packages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch international packages');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching packages by tags
 */
export function usePackagesByTags(tags: string | string[]): UsePackagesState<TourPackage> {
  const [data, setData] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const packages = await tourPackagesAPI.getByTags(tags);
      setData(packages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch packages by tags');
    } finally {
      setLoading(false);
    }
  }, [tags]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching visa-free international packages
 */
export function useVisaFreePackages(limit: number = 8): UsePackagesState<TourPackage> {
  const [data, setData] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const packages = await tourPackagesAPI.getVisaFree(limit);
      setData(packages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch visa-free packages');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching packages by continent
 */
export function usePackagesByContinent(continent: string, limit?: number): UsePackagesState<TourPackage> {
  const [data, setData] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const packages = await tourPackagesAPI.getByContinent(continent, limit);
      setData(packages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch packages by continent');
    } finally {
      setLoading(false);
    }
  }, [continent, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching packages by duration range
 */
export function usePackagesByDuration(minDays: number = 1, maxDays: number = 99, limit?: number): UsePackagesState<TourPackage> {
  const [data, setData] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const packages = await tourPackagesAPI.getByDuration(minDays, maxDays, limit);
      setData(packages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch packages by duration');
    } finally {
      setLoading(false);
    }
  }, [minDays, maxDays, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching a single tour package by slug
 */
export function useTourPackage(slug: string): UseSinglePackageState<TourPackage> {
  const [data, setData] = useState<TourPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      setError(null);
      const pkg = await tourPackagesAPI.getBySlug(slug);
      setData(pkg);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch package');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ==================== CINETRIP PACKAGES HOOKS ====================

/**
 * Hook for fetching all CineTrip packages
 */
export function useCineTripPackages(filters?: {
  category?: string;
  featured?: boolean;
}): UsePackagesState<CineTripPackage> {
  const [data, setData] = useState<CineTripPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const packages = await cineTripPackagesAPI.getAll(filters);
      setData(packages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch CineTrip packages');
    } finally {
      setLoading(false);
    }
  }, [filters?.category, filters?.featured]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching featured CineTrip packages
 */
export function useFeaturedCineTripPackages(limit: number = 8): UsePackagesState<CineTripPackage> {
  const [data, setData] = useState<CineTripPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const packages = await cineTripPackagesAPI.getFeatured(limit);
      setData(packages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch featured CineTrip packages');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching a single CineTrip package by slug
 */
export function useCineTripPackage(slug: string): UseSinglePackageState<CineTripPackage> {
  const [data, setData] = useState<CineTripPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      setError(null);
      const pkg = await cineTripPackagesAPI.getBySlug(slug);
      setData(pkg);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch CineTrip package');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
