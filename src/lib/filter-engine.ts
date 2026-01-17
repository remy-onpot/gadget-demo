import { Product } from "./types";

export interface FilterRule {
  key: string; 
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: string | number;
  field?: string; // Legacy support
}

export const matchesRules = (product: Product, rules: FilterRule[] | null): boolean => {
  if (!rules || rules.length === 0) return true; 

  return rules.every(rule => {
    // 1. SAFETY CHECK: Get the property name safely
    const propertyName = rule.key || rule.field;

    // If neither exists, skip (fail open to prevent crashes)
    if (!propertyName) return true;

    let productValue: string | number | boolean | undefined | null;

    // 2. Handle nested keys like 'specs.Storage'
    if (propertyName.startsWith('specs.')) {
      const specKey = propertyName.split('.')[1]; // e.g., 'Storage'
      const specs = product.specs || {}; // Specs might be undefined on the object
      
      // Case-insensitive lookup: Find 'storage', 'Storage', 'STORAGE'
      const foundKey = Object.keys(specs).find(k => k.toLowerCase() === specKey.toLowerCase());
      
      // Safe access: specs is defined in types.ts as Record<string, string|number|boolean>
      productValue = foundKey ? specs[foundKey] : undefined;

    } else {
      
      const safeProduct = product as unknown as Record<string, unknown>;
      
      // We only care if it's a primitive value we can compare
      const val = safeProduct[propertyName];
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
          productValue = val;
      } else {
          productValue = undefined;
      }
    }

    // If value is missing, it fails the rule
    if (productValue === undefined || productValue === null) return false;

    // 4. Normalize values for comparison
    const valA = String(productValue).toLowerCase();
    const valB = String(rule.value).toLowerCase();
    
    // Numeric comparison preparation
    const numA = Number(productValue);
    const numB = Number(rule.value);

    // 5. Run the operator check
    switch (rule.operator) {
      case 'eq': return valA === valB;
      case 'neq': return valA !== valB;
      case 'contains': return valA.includes(valB);
      
      // Numeric Checks (Ensure both are valid numbers)
      case 'gt': return !isNaN(numA) && !isNaN(numB) && numA > numB;
      case 'lt': return !isNaN(numA) && !isNaN(numB) && numA < numB;
      case 'gte': return !isNaN(numA) && !isNaN(numB) && numA >= numB;
      case 'lte': return !isNaN(numA) && !isNaN(numB) && numA <= numB;
      
      default: return false;
    }
  });
};