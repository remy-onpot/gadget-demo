import { useState, useEffect, useMemo } from 'react';
import { Product, Variant } from '@/lib/types';

export const useProductLogic = (product: Product, variants: Variant[]) => {
  const [selections, setSelections] = useState<Record<string, string>>({});

  // 1. HELPER: Normalize values (Strictly Typed)
  const normalize = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    return String(val);
  };

  // Helper to safely get specs as a Record
  const getSpecs = (v: Variant): Record<string, unknown> => {
    return (v.specs as Record<string, unknown>) || {};
  };

  // 2. HELPER: Extract specs
  const getVariantSpecs = (variant: Variant): Record<string, string> => {
    const specs = getSpecs(variant);
    return Object.entries(specs).reduce((acc, [k, v]) => ({
      ...acc,
      [k]: normalize(v)
    }), { condition: variant.condition } as Record<string, string>);
  };

  // 3. INITIALIZATION
  useEffect(() => {
    if (variants.length > 0 && Object.keys(selections).length === 0) {
      // Prioritize: New -> In Stock -> First Available
      const defaultVariant = variants.find(v => v.condition === 'New' && v.stock > 0) 
                          || variants.find(v => v.stock > 0) 
                          || variants[0];
      
      if (defaultVariant) {
        setSelections(getVariantSpecs(defaultVariant));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants]); 

  // 4. FIND MATCH
  const currentVariant = useMemo(() => {
    return variants.find(variant => {
      if (variant.condition !== selections.condition) return false;
      const specs = getSpecs(variant);
      
      // Check if every selected spec matches this variant's specs
      return Object.entries(specs).every(([k, v]) => {
        // If the variant doesn't have this spec, ignore it (or fail, depending on logic preference)
        if (!selections[k]) return true; 
        return normalize(v) === selections[k];
      });
    });
  }, [selections, variants]);

  // 5. SMART SELECTION HANDLER
  const handleSelection = (key: string, value: string) => {
    const newValue = normalize(value);
    
    // Find candidates matching the new selection
    let candidates = variants.filter(v => {
      const specs = getSpecs(v);
      if (key === 'condition') return v.condition === newValue;
      return normalize(specs[key]) === newValue;
    });

    // If changing a spec, try to stay in current condition
    if (key !== 'condition') {
       const strictCandidates = candidates.filter(v => v.condition === selections.condition);
       if (strictCandidates.length > 0) candidates = strictCandidates;
    }

    if (candidates.length === 0) return; // Should not happen if UI is correct

    // Find best match among candidates
    let bestMatch = candidates[0];
    let maxMatchScore = -1;

    candidates.forEach(variant => {
      const specs = getSpecs(variant);
      let score = 0;
      
      Object.keys(selections).forEach(currentKey => {
        if (currentKey === key) return; // Don't count the key we just changed
        
        const variantValue = currentKey === 'condition' 
            ? variant.condition 
            : normalize(specs[currentKey]);
            
        if (variantValue === selections[currentKey]) score++;
      });
      
      // Prefer in-stock items
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
    
    // Only show specs available for the CURRENT condition
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

  // 7. AVAILABILITY CHECKER
  const isOptionAvailable = (key: string, value: string) => {
    const val = normalize(value);
    
    if (key === 'condition') {
       return variants.some(v => v.condition === val);
    }
    
    // Check if this spec value exists within the currently selected condition
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