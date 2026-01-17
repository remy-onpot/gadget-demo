import { unstable_cache } from 'next/cache';

// 1. Strict Callback Type
type CacheCallback<T, A extends unknown[]> = (...args: A) => Promise<T>;

// 2. Strict Options Type
type CacheOptions = { 
  tags?: string[]; 
  revalidate?: number | false; 
} | string[];

export function cacheService<T, A extends unknown[]>(
  fetcher: CacheCallback<T, A>,
  keyParts: string[],
  options: CacheOptions
): CacheCallback<T, A> {
  
  // 3. Normalize Options
  const finalOptions = Array.isArray(options) 
    ? { tags: options, revalidate: 3600 } 
    : options;

  // 4. Return cached function
  return unstable_cache(
    fetcher,
    keyParts,
    finalOptions
  );
}