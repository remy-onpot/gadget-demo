import { Footer } from "@/components/landing/Footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#020617] min-h-screen text-slate-300">
      <div className="container mx-auto px-6 py-20 max-w-3xl">
         {/* Simple Header for Legal Pages */}
         <div className="mb-12 border-b border-white/10 pb-8">
            <a href="/" className="text-2xl font-black text-white">Nimde<span className="text-green-500">Shop</span></a>
         </div>
         <div className="prose prose-invert prose-lg">
            {children}
         </div>
      </div>
      <Footer />
    </div>
  );
}