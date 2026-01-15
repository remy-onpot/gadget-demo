'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FilterOption } from '@/lib/services/filters';

export const FilterSidebar = ({ filters }: { filters: FilterOption[] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Logic: If checked, add. If unchecked, remove.
    // For simplicity in this demo, we assume single-select per attribute or 
    // simple "contains" logic. Here we allow multiple values (e.g. ?ram=8GB&ram=16GB)
    if (checked) {
      params.append(key, value);
    } else {
      params.delete(key, value);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <div>
        <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
           Filters
        </h3>
        <p className="text-xs text-slate-500 font-bold mt-1">Refine your results</p>
      </div>

      {filters.map((filter) => (
        <div key={filter.key} className="space-y-3 pb-6 border-b border-gray-100 last:border-0">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">
            {filter.key}
          </h4>
          <div className="space-y-2.5">
            {filter.values.map((val) => {
              const isChecked = searchParams.getAll(filter.key).includes(val);
              return (
                <label key={val} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-slate-900 border-slate-900' : 'border-gray-300 bg-white group-hover:border-orange-400'}`}>
                    {isChecked && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={isChecked}
                    onChange={(e) => handleFilterChange(filter.key, val, e.target.checked)}
                  />
                  <span className={`text-sm font-bold transition-colors ${isChecked ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                    {val}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
      
      {filters.length === 0 && (
        <div className="text-sm text-slate-400 italic">No filters available for this category.</div>
      )}
    </div>
  );
};