import { Product } from "./types";

export interface FilterRule {
  key: string; 
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: string | number;
  field?: string; // Add optional legacy support
}

export const matchesRules = (product: Product, rules: FilterRule[] | null): boolean => {
  if (!rules || rules.length === 0) return true; 

  return rules.every(rule => {
    // 1. SAFETY CHECK: Get the property name safely
    // We check for 'key' (new format) OR 'field' (old format)
    const propertyName = rule.key || rule.field;

    // If neither exists, this rule is broken. Skip it (return true) so the app doesn't crash.
    if (!propertyName) return true;

    let productValue: any;

    // 2. Handle nested keys like 'specs.Storage'
    if (propertyName.startsWith('specs.')) {
      const specKey = propertyName.split('.')[1]; // e.g., 'Storage'
      const specs = product.specs as Record<string, any>;
      
      // Case-insensitive lookup: Find 'storage', 'Storage', 'STORAGE'
      const foundKey = Object.keys(specs || {}).find(k => k.toLowerCase() === specKey.toLowerCase());
      productValue = foundKey ? specs[foundKey] : undefined;
    } else {
      // Standard keys like 'price', 'brand'
      productValue = (product as any)[propertyName];
    }

    if (productValue === undefined || productValue === null) return false;

    // 3. Normalize values for comparison
    const valA = String(productValue).toLowerCase();
    const valB = String(rule.value).toLowerCase();
    const numA = Number(productValue);
    const numB = Number(rule.value);

    // 4. Run the operator check
    switch (rule.operator) {
      case 'eq': return valA === valB;
      case 'neq': return valA !== valB;
      case 'contains': return valA.includes(valB);
      case 'gt': return !isNaN(numA) && !isNaN(numB) && numA > numB;
      case 'lt': return !isNaN(numA) && !isNaN(numB) && numA < numB;
      case 'gte': return !isNaN(numA) && !isNaN(numB) && numA >= numB;
      case 'lte': return !isNaN(numA) && !isNaN(numB) && numA <= numB;
      default: return false;
    }
  });
};