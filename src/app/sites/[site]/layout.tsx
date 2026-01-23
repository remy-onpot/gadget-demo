import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers"; // 1. Import headers
import "@/app/globals.css";

// Components
import { DesktopSuggestion } from '@/components/shop/DesktopSuggestion';
import { ThemeInjector } from "@/components/ThemeInjector";
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StoreInitializer } from '@/components/storefront/StoreInitializer';

// Database & Services
import { createClient } from "@/lib/supabase-server";
import { Database } from "@/lib/database.types";
import { getGlobalData } from "@/lib/services/global";

type StoreRow = Database['public']['Tables']['stores']['Row'];
type SiteParams = Promise<{ site: string }>;

// Helper to fetch store data consistently
async function getStore(slug: string): Promise<StoreRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}

// ... generateMetadata function remains the same ...
export async function generateMetadata(
  { params }: { params: SiteParams }
): Promise<Metadata> {
    // ... existing metadata code ...
    const resolvedParams = await params;
    const store = await getStore(resolvedParams.site);
    if (!store) return { title: "Store Not Found" };
    
    const settings = (store.settings as Record<string, string>) || {};
    return {
        title: settings.site_title || `${store.name} | Home`,
        description: settings.site_description
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
  const store = await getStore(resolvedParams.site);

  if (!store) return notFound();

  // 1. GET CURRENT PATH
  // We use the 'x-url' header or fallback to checking the request context if available.
  // Note: In some hosting environments, you might need middleware to pass the pathname.
  // A simpler way for visual logic is checking if the children effectively 'hide' it,
  // but let's use a robust header check or simple conditional rendering.
  
  // ⚡ SIMPLER APPROACH: We will render Header/Footer by default,
  // but you can wrap the specific Page components (Login/Checkout) 
  // in a "NoLayout" wrapper if you want strict control. 
  
  // However, for this file, let's fetch the data needed for the header/footer
  // even if we might visually hide them later.
  const { settings, categories } = await getGlobalData(store.id);
  const themeColor = settings.theme_color || '#f97316'; 

  // 2. DETECT "ISOLATED" PAGES
  // In Next.js Server Components, getting the pathname can be tricky without middleware.
  // If you are using middleware.ts, ensure it sets a header like 'x-pathname'.
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || ""; 
  
  // If you haven't set up the middleware to pass 'x-pathname', 
  // we can assume we show them everywhere, OR you can use a Client Component wrapper.
  // Let's assume for now we SHOW them everywhere except where the PAGE explicitly hides them (CSS) 
  // OR we use the standard approach:
  
  // LOGIC: Hide on Login and Checkout
  // Note: This string check is rough. Ensure your middleware.ts sets this header!
  const isIsolatedPage = pathname.includes('/login') || pathname.includes('/checkout');

  // JSON-LD (Rich Results)
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      
        <ThemeInjector color={themeColor} />
        <StoreInitializer storeId={store.id} />

        <div className="flex flex-col min-h-screen">
            {/* CONDITIONAL HEADER */}
            {!isIsolatedPage && <Header settings={settings} categories={categories} />}
            
            <main className="flex-grow">
              {children}
            </main>

            {/* CONDITIONAL FOOTER */}
{!isIsolatedPage && <Footer settings={settings} categories={categories} />}        </div>

        <DesktopSuggestion />
        <Toaster position="top-center" richColors />
    </>
  );
}