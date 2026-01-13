export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    const value = window.localStorage.getItem(key);
    return { value }; // Mimicking the structure your code expects
  },
  set: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  }
};