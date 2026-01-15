import { unstable_cache } from 'next/cache';

// This new signature accepts any function arguments (A) and return type (T)
export function cacheService<T, A extends any[]>(
  fetcher: (...args: A) => Promise<T>,
  keyParts: string[],
  options: { tags?: string[]; revalidate?: number } | string[]
) {
  // 1. Normalize Options
  // Support both styles: cacheService(fn, key, ['tag']) AND cacheService(fn, key, { tags: [], revalidate: 60 })
  const finalOptions = Array.isArray(options) 
    ? { tags: options, revalidate: 3600 } 
    : options;

  // 2. Return the cached version preserving the original arguments
  return unstable_cache(
    fetcher,
    keyParts,
    finalOptions
  );
}