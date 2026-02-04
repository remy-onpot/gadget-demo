import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { cache } from 'react'; 
import "@/app/globals.css";

// Components
import { DesktopSuggestion } from '@/components/shop/DesktopSuggestion';
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StoreInitializer } from '@/components/storefront/StoreInitializer';
import { ThemeWrapper } from '@/components/storefront/ThemeWrapper';
import { CardType } from '@/lib/types';

// Database & Services
import { createClient } from "@/lib/supabase-server";
import { Database } from "@/lib/database.types";
import { getGlobalData } from "@/lib/services/global";
import { getContrastColor } from '@/lib/theme-generator'; // ✅ Import your new theme logic

// ✅ FORCE DYNAMIC RENDERING: Prevent cross-store contamination
export const dynamic = 'force-dynamic';

type StoreRow = Database['public']['Tables']['stores']['Row'];
type SiteParams = Promise<{ site: string }>;

// ✅ OPTIMIZATION: React Cache to prevent double DB calls
const getStoreCached = cache(async (slug: string): Promise<StoreRow | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from('stores').select('*').eq('slug', slug).single();
  return data;
});

// 1. METADATA (SEO + SOCIAL CARDS)
export async function generateMetadata(
  { params }: { params: SiteParams }
): Promise<Metadata> {
    const resolvedParams = await params;
    const store = await getStoreCached(resolvedParams.site);
    
    if (!store) return { title: "Store Not Found" };
    
    // Cast settings to a flexible object
    const settings = (store.settings as Record<string, string>) || {};
    
    const title = settings.site_title || `${store.name}`;
    const description = settings.site_description || `Shop the best products at ${store.name}`;
    const image = settings.site_logo || '/default-og.jpg'; // Ensure you have a default in public/

    return {
        title: {
            default: title,
            template: `%s | ${store.name}`
        },
        description: description,
        // Social Sharing (WhatsApp/Twitter/Facebook)
        openGraph: {
            title: title,
            description: description,
            images: [image],
            type: 'website',
            siteName: store.name,
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [image],
        },
        icons: {
            icon: settings.site_favicon || '/favicon.ico',
        }
    };
}

export default async function SiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: SiteParams;
}>) {
  const resolvedParams = await params;
  const store = await getStoreCached(resolvedParams.site);

  if (!store) return notFound();

  // Fetch Settings & Categories
  const { settings, categories } = await getGlobalData(store.id);

  // 2. THEME ENGINE (The "No-Code" Logic)
  const primary = settings.primary_color || '#f97316';
  const bg = settings.bg_color || '#F8FAFC';
  
  // Auto-Calculate Text Color if not manually set (Guardrail)
  const textColor = settings.text_color || getContrastColor(bg);

  const themeStyles = {
    '--primary': primary,
    '--page-bg': bg,
    '--card-bg': settings.card_bg_color || '#FFFFFF',
    '--text-main': textColor,
    '--radius': settings.border_radius || '1rem',
    
    // Derived Opacities (Useful for hover states/badges)
    '--primary-10': `${primary}1a`, // 10% opacity
    '--primary-20': `${primary}33`, // 20% opacity
  } as React.CSSProperties;

  // Theme context values for ProductCard and other components
  // Note: settings values may be strings or booleans from JSON
  const storefrontTheme = {
    primaryColor: primary,
    cardType: (settings.card_type as CardType) || 'tech',
    borderRadius: settings.border_radius || '1rem',
    glassMode: String(settings.glass_mode) === 'true',
    cardBgColor: settings.card_bg_color || '#FFFFFF',
  };

  // 3. PAGE ISOLATION LOGIC
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || ""; 
  // Hide Header/Footer on specific checkout/login flows if needed
  const isIsolatedPage = pathname.includes('/login') || pathname.includes('/checkout');

  // 4. JSON-LD (Rich Snippets for Google)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name || 'My Store',
    image: settings.site_logo,
    description: settings.site_description,
    telephone: settings.support_phone,
    address: {
        '@type': 'PostalAddress',
        streetAddress: settings.address_display || 'Online Store',
        addressCountry: 'GH'
    },
    openingHours: settings.business_hours || "Mo-Sa 09:00-18:00", 
    url: settings.site_url || `https://${resolvedParams.site}.nimdeshop.com`
  };

  return (
    <>
        {/* Inject Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      
        {/* Initialize Client Stores (Cart, etc) */}
        <StoreInitializer storeId={store.id} />

        {/* ✅ APPLY THEME VARIABLES GLOBALLY */}
        <div 
            className="flex flex-col min-h-screen font-sans transition-colors duration-500 ease-in-out"
            style={{
                ...themeStyles,
                backgroundColor: 'var(--page-bg)',
                color: 'var(--text-main)'
            }}
        >
            {!isIsolatedPage && <Header settings={settings} categories={categories} />}
            
            <main className={`flex-grow ${!isIsolatedPage ? 'pt-[72px] md:pt-[80px]' : ''}`}>
              <ThemeWrapper theme={storefrontTheme}>
                {children}
              </ThemeWrapper>
            </main>

            {!isIsolatedPage && <Footer settings={settings} categories={categories} />}
        </div>

        {/* Global Utilities */}
        <DesktopSuggestion />
        <Toaster position="top-center" richColors />
    </>
  );
}