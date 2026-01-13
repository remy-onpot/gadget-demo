import { Skeleton } from "@/components/ui/Skeleton";

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-4 h-full border border-gray-100 flex flex-col">
      
      {/* Image Area */}
      <div className="relative h-40 md:h-52 bg-gray-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
         <Skeleton className="w-3/4 h-3/4 rounded-xl" />
         <div className="absolute top-2 left-2">
            <Skeleton className="w-12 h-5 rounded-full" />
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col space-y-3">
         
         {/* Category & Brand */}
         <div className="flex justify-between items-center">
            <Skeleton className="w-20 h-4 rounded-full" />
            <Skeleton className="w-12 h-4 rounded-full" />
         </div>

         {/* Title (2 lines) */}
         <div className="space-y-1">
            <Skeleton className="w-full h-5 rounded-md" />
            <Skeleton className="w-2/3 h-5 rounded-md" />
         </div>

         {/* Specs Bar */}
         <Skeleton className="w-full h-8 rounded-lg mt-1" />

         {/* Price & Action Row */}
         <div className="mt-auto pt-3 flex items-end justify-between border-t border-gray-50">
            <div className="space-y-1">
               <Skeleton className="w-8 h-3 rounded" />
               <Skeleton className="w-24 h-6 rounded" />
            </div>
            <Skeleton className="w-10 h-10 rounded-full" />
         </div>
      </div>
    </div>
  );
};

// A helper to render a grid of them easily
export const ProductGridSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array(count).fill(0).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};