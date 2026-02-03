// 1. VALIDATION
export const isValidHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

// 2. HELPERS
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Calculate relative luminance
const getLuminance = (r: number, g: number, b: number) => {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// 3. CONTRAST SCORING
export const getContrastScore = (hex1: string, hex2: string): 'AAA' | 'AA' | 'Fail' => {
  if (!isValidHex(hex1) || !isValidHex(hex2)) return 'Fail';
  
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 'Fail';

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
};

// 4. AUTO-SUGGEST FIXER (Gap #3)
// Finds the nearest color that passes AA contrast against white (for buttons)
export const suggestAccessibleColor = (baseHex: string, target: 'lighten' | 'darken'): string => {
    const rgb = hexToRgb(baseHex);
    if (!rgb) return baseHex;

    let { r, g, b } = rgb;
    let attempts = 0;
    
    // Naive iterative approach: Darken/Lighten by 5% until contrast passes
    while (attempts < 20) {
        const currentHex = rgbToHex(r, g, b);
        const score = getContrastScore(currentHex, '#FFFFFF'); // Checks against white text
        if (score !== 'Fail') return currentHex;

        if (target === 'darken') {
            r = Math.max(0, r - 10);
            g = Math.max(0, g - 10);
            b = Math.max(0, b - 10);
        } else {
            r = Math.min(255, r + 10);
            g = Math.min(255, g + 10);
            b = Math.min(255, b + 10);
        }
        attempts++;
    }
    return baseHex; // Fallback
};

// 5. COLOR GENERATOR (Phase 4)
export const getCategoryHue = (name: string): number => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 360);
};

export const getContrastColor = (hex: string): '#0F172A' | '#FFFFFF' => {
  if (!isValidHex(hex)) return '#0F172A';
  const rgb = hexToRgb(hex);
  if (!rgb) return '#0F172A';
  const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
  return (yiq >= 128) ? '#0F172A' : '#FFFFFF';
};

// 6. PRESETS ( The "Magic Buttons" )
export const THEME_PRESETS = [
  {
    id: 'modern_minimal',
    name: 'Modern Minimal',
    colors: { primary: '#4F46E5', bg: '#F8FAFC', card: '#FFFFFF' },
    radius: '0.5rem'
  },
  {
    id: 'warm_boutique',
    name: 'Warm Boutique',
    colors: { primary: '#EA580C', bg: '#FFF7ED', card: '#FFFFFF' },
    radius: '1.5rem'
  },
  {
    id: 'dark_bold',
    name: 'Tech Dark',
    colors: { primary: '#3B82F6', bg: '#0F172A', card: '#1E293B' },
    radius: '0px'
  },
  {
    id: 'luxury',
    name: 'Luxury',
    colors: { primary: '#D4AF37', bg: '#1C1917', card: '#292524' },
    radius: '0px'
  },
  {
    id: 'organic',
    name: 'Organic',
    colors: { primary: '#15803D', bg: '#F0FDF4', card: '#FFFFFF' },
    radius: '1rem'
  }
];

// 7. GRADIENT COLOR GENERATOR (For Glassmorphism Backgrounds)
export const generateGradientColors = (baseHex: string): { bg: string; blob1: string; blob2: string; blob3: string } => {
  if (!isValidHex(baseHex)) {
    // Fallback to orange if invalid
    baseHex = '#f97316';
  }

  const rgb = hexToRgb(baseHex);
  if (!rgb) {
    return {
      bg: 'from-orange-50 via-pink-50 to-purple-50',
      blob1: 'rgba(147, 51, 234, 0.3)', // purple
      blob2: 'rgba(249, 115, 22, 0.3)', // orange
      blob3: 'rgba(236, 72, 153, 0.3)', // pink
    };
  }

  // Convert RGB to HSL for better color manipulation
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = Math.round(h * 360);

  // Generate 3 variations with different hues
  const hue1 = h;
  const hue2 = (h + 60) % 360; // Complementary
  const hue3 = (h + 120) % 360; // Triadic

  return {
    bg: `from-[hsl(${hue1},70%,95%)] via-[hsl(${hue2},70%,95%)] to-[hsl(${hue3},70%,95%)]`,
    blob1: `hsla(${hue1}, 70%, 65%, 0.3)`,
    blob2: `hsla(${hue2}, 70%, 65%, 0.3)`,
    blob3: `hsla(${hue3}, 70%, 65%, 0.3)`,
  };
};