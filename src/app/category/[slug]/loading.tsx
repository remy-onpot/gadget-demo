import { ProductCardSkeleton } from '@/components/skeletons/ProductCardSkeleton';

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
      {/* 1. Mock Header */}
      <div className="bg-white border-b border-gray-200 h-16 sticky top-0 z-30 opacity-80" />
      
      {/* 2. Mock Content */}
      <div className="container mx-auto px-4 py-8 animate-pulse">
        {/* Title Placeholder */}
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-8" />
        
        {/* The Grid of Ghosts */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
           {/* Render 8 skeletons to fill the viewport */}
           {Array.from({ length: 8 }).map((_, i) => (
             <ProductCardSkeleton key={i} />
           ))}
        </div>
      </div>
    </div>
  );
}