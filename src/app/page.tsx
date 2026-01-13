import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { BrandHero } from '@/components/home/BrandHero'; // Updated import path to shop
import { HeroGrid } from '@/components/home/HeroGrid';   // Updated import path to shop
import { FeaturedRow } from '@/components/home/FeaturedRow'; // Updated import path to shop
import CategoryFeed from '@/components/shop/CategoryFeed'; // <-- NEW DYNAMIC FEED
import { BranchSlider } from '@/components/home/BranchSlider';
import { SocialGrid } from '@/components/home/SocialGrid';
import { Footer } from '@/components/layout/Footer';
import { Product } from '@/lib/types';
import { Phone, Facebook, Instagram, Linkedin, MessageCircle, Twitter } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  
  // 1. FETCH DATA
  const [bannersRes, productsRes, settingsRes] = await Promise.all([
    supabase.from('banners').select('*').eq('is_active', true),
    
    // We only need featured products here now, CategoryFeed handles the rest
    supabase.from('products')
      .select('*, images:base_images, price:base_price') 
      .eq('is_active', true)
      .eq('isFeatured', true) // Only fetch featured for the top row
      .order('created_at', { ascending: false })
      .limit(4),

    supabase.from('site_settings').select('*')
  ]);

  const banners = bannersRes.data || [];
  const featuredProducts = (productsRes.data || []) as Product[];
  
  const settings = (settingsRes.data || []).reduce((acc: Record<string, string>, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  // SPECIFIC BANNER FILTERS
  const brandBanners = banners.filter(b => b.slot === 'brand_hero');
  const heroGridBanners = banners.filter(b => ['main_hero', 'side_top', 'side_bottom'].includes(b.slot));
  const branchBanners = banners.filter(b => b.slot === 'branch_slider');

  const allSocials = [
    { id: 'wa', icon: Phone, label: "WhatsApp", color: "text-green-600", bg: "bg-green-50", link: settings['whatsapp_phone'] ? `https://wa.me/${settings['whatsapp_phone']}` : null },
    { id: 'fb', icon: Facebook, label: "Facebook", color: "text-blue-600", bg: "bg-blue-50", link: settings['social_facebook'] },
    { id: 'ig', icon: Instagram, label: "Instagram", color: "text-pink-600", bg: "bg-pink-50", link: settings['social_instagram'] },
    { id: 'x', icon: Twitter, label: "X", color: "text-slate-900", bg: "bg-slate-100", link: settings['social_twitter'] },
    { id: 'li', icon: Linkedin, label: "LinkedIn", color: "text-blue-700", bg: "bg-blue-50", link: settings['social_linkedin'] },
  ];
  const activeSocials = allSocials.filter(s => s.link);

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
       <Header /> 

       <main className="pt-20 md:pt-28 space-y-0 md:space-y-2">
          
          {/* 1. BRAND HERO (Cinematic Strip) */}
          <BrandHero banners={brandBanners} />

          {/* 2. MAIN HERO GRID (Mesh Gradients) */}
          <HeroGrid banners={heroGridBanners} />
          
          {/* 3. FEATURED PRODUCTS */}
          <FeaturedRow products={featuredProducts} />

          {/* 4. DYNAMIC CATEGORY FEED 
              Replaces the hardcoded rails. 
              Automatically creates rails for Laptop, Phone, Tablet, Drone, etc.
          */}
          <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
            <CategoryFeed />
          </div>

          <SocialGrid settings={settings} />

          <BranchSlider banners={branchBanners} settings={settings} />

          {/* CONNECT SECTION */}
          <section className="py-10 md:py-16 bg-gray-50 border-t border-gray-100">
              <div className="container mx-auto px-4 text-center">
                 <h3 className="font-black text-lg md:text-2xl text-slate-900 mb-6 md:mb-10">Connect With Us</h3>
                 {activeSocials.length > 0 ? (
                   <div className="flex flex-wrap justify-center gap-4 md:gap-10">
                      {activeSocials.map((social) => (
                         <a key={social.id} href={social.link!} target="_blank" className="flex flex-col items-center gap-2 group">
                            <div className={`w-12 h-12 md:w-16 md:h-16 ${social.bg} rounded-2xl flex items-center justify-center border border-transparent group-hover:border-gray-200 shadow-sm transition-all`}>
                               <social.icon size={20} className={`md:w-7 md:h-7 ${social.color}`} />
                            </div>
                            <span className="text-[10px] md:text-sm font-bold text-slate-400 group-hover:text-slate-900">{social.label}</span>
                         </a>
                      ))}
                   </div>
                 ) : (
                    <p className="text-slate-400 text-sm italic">Social links coming soon.</p>
                 )}
              </div>
          </section>

          {/* REQUEST CTA */}
          <section className="py-12 md:py-20 px-4 bg-white">
            <div className="container mx-auto max-w-7xl">
              <div className="bg-[#F8FAFC] rounded-3xl md:rounded-[2.5rem] p-6 md:p-16 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 text-center md:text-left">
                 <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-orange-600 font-bold tracking-widest text-[10px] md:text-xs uppercase mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"/> Global Shipping
                    </div>
                    <h2 className="text-2xl md:text-5xl font-black text-slate-900 mb-2 md:mb-6 leading-tight">Can't find it?</h2>
                    <p className="text-slate-500 text-sm md:text-lg leading-relaxed">We import specific requests directly from the USA & UK. <span className="block mt-1">Delivered in <strong>14-21 days</strong>.</span></p>
                 </div>
                 <div className="flex-shrink-0 w-full md:w-auto">
                    {settings['whatsapp_phone'] && (
                      <a href={`https://wa.me/${settings['whatsapp_phone']}?text=Requesting...`} target="_blank" className="w-full md:w-auto bg-[#0A2540] text-white px-8 py-4 rounded-xl font-bold text-sm md:text-lg hover:scale-105 transition-transform shadow-lg shadow-slate-900/10 flex items-center justify-center gap-3">
                        Start Request <MessageCircle size={18} />
                      </a>
                    )}
                 </div>
              </div>
            </div>
          </section>

       </main>

       <Footer settings={settings} />
    </div>
  );
}