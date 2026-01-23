import { useState, useEffect, useMemo } from 'react';
import { Database } from '@/lib/database.types';

// 1. DEFINE TYPES FROM DATABASE
type Product = Database['public']['Tables']['products']['Row'];
type Variant = Database['public']['Tables']['product_variants']['Row'];

export const useProductLogic = (product: Product, variants: Variant[]) => {
  const [selections, setSelections] = useState<Record<string, string>>({});

  // 2. HELPER: Normalize values
  const normalize = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    return String(val);
  };

  // 3. HELPER: Safely get specs from JSON
  const getSpecs = (v: Variant): Record<string, unknown> => {
    return (v.specs as Record<string, unknown>) || {};
  };

  // 4. HELPER: Extract flat specs for state
  const getVariantSpecs = (variant: Variant): Record<string, string> => {
    const specs = getSpecs(variant);
    return Object.entries(specs).reduce((acc, [k, v]) => ({
      ...acc,
      [k]: normalize(v)
    }), { condition: variant.condition } as Record<string, string>);
  };

  // 5. INITIALIZATION
  useEffect(() => {
    if (variants.length > 0 && Object.keys(selections).length === 0) {
      // Prioritize: New -> In Stock -> First Available
      // FIX: Use (v.stock ?? 0) to handle potential nulls
      const defaultVariant = variants.find(v => v.condition === 'New' && (v.stock ?? 0) > 0) 
                          || variants.find(v => (v.stock ?? 0) > 0) 
                          || variants[0];
      
      if (defaultVariant) {
        setSelections(getVariantSpecs(defaultVariant));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants]); 

  // 6. FIND MATCH
  const currentVariant = useMemo(() => {
    return variants.find(variant => {
      if (variant.condition !== selections.condition) return false;
      const specs = getSpecs(variant);
      
      return Object.entries(specs).every(([k, v]) => {
        if (!selections[k]) return true; 
        return normalize(v) === selections[k];
      });
    });
  }, [selections, variants]);

  // 7. SELECTION HANDLER
  const handleSelection = (key: string, value: string) => {
    const newValue = normalize(value);
    
    let candidates = variants.filter(v => {
      const specs = getSpecs(v);
      if (key === 'condition') return v.condition === newValue;
      return normalize(specs[key]) === newValue;
    });

    if (key !== 'condition') {
       const strictCandidates = candidates.filter(v => v.condition === selections.condition);
       if (strictCandidates.length > 0) candidates = strictCandidates;
    }

    if (candidates.length === 0) return;

    let bestMatch = candidates[0];
    let maxMatchScore = -1;

    candidates.forEach(variant => {
      const specs = getSpecs(variant);
      let score = 0;
      
      Object.keys(selections).forEach(currentKey => {
        if (currentKey === key) return;
        
        const variantValue = currentKey === 'condition' 
            ? variant.condition 
            : normalize(specs[currentKey]);
            
        if (variantValue === selections[currentKey]) score++;
      });
      
      // FIX: Use (variant.stock ?? 0)
      if ((variant.stock ?? 0) > 0) score += 0.5;

      if (score > maxMatchScore) {
        maxMatchScore = score;
        bestMatch = variant;
      }
    });

    if (bestMatch) {
      setSelections(getVariantSpecs(bestMatch));
    }
  };

  // 8. OPTIONS GENERATOR
  const options = useMemo(() => {
    const conditions = Array.from(new Set(variants.map(v => v.condition))).sort();
    
    const validVariants = variants.filter(v => v.condition === selections.condition);
    
    const specsMap: Record<string, Set<string>> = {};
    
    validVariants.forEach(v => {
      const specs = getSpecs(v);
      Object.entries(specs).forEach(([k, val]) => {
        if (!specsMap[k]) specsMap[k] = new Set();
        specsMap[k].add(normalize(val));
      });
    });

    const specOptions = Object.entries(specsMap).reduce((acc, [k, set]) => {
      acc[k] = Array.from(set).sort();
      return acc;
    }, {} as Record<string, string[]>);

    return { condition: conditions, ...specOptions };
  }, [variants, selections.condition]);

  const isOptionAvailable = (key: string, value: string) => {
    const val = normalize(value);
    
    if (key === 'condition') {
       return variants.some(v => v.condition === val);
    }
    
    return variants.some(v => {
      const specs = getSpecs(v);
      return v.condition === selections.condition && normalize(specs[key]) === val;
    });
  };

  return {
    selections,
    handleSelection,
    currentVariant,
    options,
    isOptionAvailable, 
    isAvailable: isOptionAvailable 
  };
};