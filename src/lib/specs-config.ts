import { Category } from "./types";

export interface SpecField {
  key: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'select' | 'checkbox';
  options?: string[]; // For select inputs
}

export const CATEGORY_TEMPLATES: Record<Category, SpecField[]> = {
  laptop: [
    { key: 'processor', label: 'Processor', type: 'text', placeholder: 'i7-1165G7' },
    { key: 'ram', label: 'RAM', type: 'text', placeholder: '16GB' },
    { key: 'storage', label: 'Storage', type: 'text', placeholder: '512GB SSD' },
    { key: 'screen_size', label: 'Screen', type: 'text', placeholder: '14 inch' },
    { key: 'touchscreen', label: 'Touchscreen', type: 'checkbox' },
    { key: 'form_factor', label: 'Form Factor', type: 'select', options: ['Standard', 'x360 2-in-1', 'Detachable'] }
  ],
  phone: [
    { key: 'storage', label: 'Storage', type: 'text', placeholder: '256GB' },
    { key: 'ram', label: 'RAM', type: 'text', placeholder: '8GB' },
    { key: 'color', label: 'Color', type: 'text', placeholder: 'Graphite' },
    { key: 'screen_size', label: 'Screen', type: 'text', placeholder: '6.7 inch' }
  ],
  audio: [
    { key: 'type', label: 'Type', type: 'select', options: ['Headphone', 'Earbuds', 'Speaker'] },
    { key: 'battery', label: 'Battery Life', type: 'text', placeholder: '30 Hours' },
    { key: 'noise_cancelling', label: 'ANC', type: 'checkbox' }
  ],
  monitor: [
    { key: 'resolution', label: 'Resolution', type: 'text', placeholder: '4K UHD' },
    { key: 'refresh_rate', label: 'Refresh Rate', type: 'text', placeholder: '144Hz' },
    { key: 'panel_type', label: 'Panel', type: 'select', options: ['IPS', 'VA', 'OLED', 'TN'] }
  ],
  // ... Add others (gaming, printer, etc.) as needed with defaults
  gaming: [
    { key: 'storage', label: 'Storage', type: 'text', placeholder: '825GB' },
    { key: 'edition', label: 'Edition', type: 'text', placeholder: 'Standard' }
  ],
  tablet: [], printer: [], accessory: [], camera: [], tv: [], wearable: [] 
};