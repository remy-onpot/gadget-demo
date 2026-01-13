import { useState, useEffect, useMemo } from 'react';
import { Product, Variant } from '@/lib/types';

export const useProductLogic = (product: Product, variants: Variant[]) => {
  const [selections, setSelections] = useState<Record<string, string>>({});

  // 1. HELPER: Normalize values
  const normalize = (val: any) => String(val);

  // 2. HELPER: Extract specs
  const getVariantSpecs = (variant: Variant): Record<string, string> => {
    return Object.entries(variant.specs).reduce((acc, [k, v]) => ({
      ...acc,
      [k]: normalize(v)
    }), { condition: variant.condition });
  };

  // 3. INITIALIZATION
  useEffect(() => {
    if (variants.length > 0 && Object.keys(selections).length === 0) {
      const defaultVariant = variants.find(v => v.condition === 'New' && v.stock > 0) 
                          || variants.find(v => v.stock > 0) 
                          || variants[0];
      
      if (defaultVariant) {
        setSelections(getVariantSpecs(defaultVariant));
      }
    }
  }, [variants]);

  // 4. FIND MATCH
  const currentVariant = useMemo(() => {
    return variants.find(variant => {
      if (variant.condition !== selections.condition) return false;
      return Object.entries(variant.specs).every(([k, v]) => {
        return normalize(v) === selections[k];
      });
    });
  }, [selections, variants]);

  // 5. SMART SELECTION HANDLER
  const handleSelection = (key: string, value: string) => {
    const newValue = normalize(value);
    
    // Find candidates matching the new selection
    let candidates = variants.filter(v => {
      if (key === 'condition') return v.condition === newValue;
      return normalize(v.specs[key]) === newValue;
    });

    // If changing a spec, try to stay in current condition
    if (key !== 'condition') {
       const strictCandidates = candidates.filter(v => v.condition === selections.condition);
       if (strictCandidates.length > 0) candidates = strictCandidates;
    }

    // Find best match among candidates
    let bestMatch = candidates[0];
    let maxMatchScore = -1;

    candidates.forEach(variant => {
      let score = 0;
      Object.keys(selections).forEach(currentKey => {
        if (currentKey === key) return;
        const variantValue = currentKey === 'condition' ? variant.condition : normalize(variant.specs[currentKey]);
        if (variantValue === selections[currentKey]) score++;
      });
      if (variant.stock > 0) score += 0.5;

      if (score > maxMatchScore) {
        maxMatchScore = score;
        bestMatch = variant;
      }
    });

    if (bestMatch) {
      setSelections(getVariantSpecs(bestMatch));
    }
  };

  // 6. OPTIONS GENERATOR
  const options = useMemo(() => {
    const conditions = Array.from(new Set(variants.map(v => v.condition))).sort();
    const validVariants = variants.filter(v => v.condition === selections.condition);
    
    const specs: Record<string, Set<string>> = {};
    validVariants.forEach(v => {
      Object.entries(v.specs).forEach(([k, val]) => {
        if (!specs[k]) specs[k] = new Set();
        specs[k].add(normalize(val));
      });
    });

    const specOptions = Object.entries(specs).reduce((acc, [k, set]) => {
      acc[k] = Array.from(set).sort();
      return acc;
    }, {} as Record<string, string[]>);

    return { condition: conditions, ...specOptions };
  }, [variants, selections.condition]);

  // 7. RESTORED HELPER: isAvailable / isOptionAvailable
  // This prevents the "isAvailable is not a function" crash.
  const isOptionAvailable = (key: string, value: string) => {
    const val = normalize(value);
    
    if (key === 'condition') {
       return variants.some(v => v.condition === val);
    }
    
    // Check if this spec value exists within the currently selected condition
    return variants.some(v => 
      v.condition === selections.condition && 
      normalize(v.specs[key]) === val
    );
  };

  return {
    selections,
    handleSelection,
    currentVariant,
    options,
    isOptionAvailable, // <--- Added back to fix crash
    isAvailable: isOptionAvailable // <--- Alias added just in case your component uses this name
  };
};