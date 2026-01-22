import { Metadata } from "next";
import "@/app/globals.css";

// Components
import { DesktopSuggestion } from '@/components/shop/DesktopSuggestion';
import { ThemeInjector } from "@/components/ThemeInjector";
import { Toaster } from 'sonner';

// Database
import { createClient } from "@/lib/supabase-server";
import { Database } from "@/lib/database.types"; // Ensure you import this

// 1. DEFINE TYPES
type StoreRow = Database['public']['Tables']['stores']['Row'];
type SiteParams = Promise<{ site: string }>; // ✅ Next.js 15 Fix

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

// 2. DYNAMIC METADATA (Store SEO)
export async function generateMetadata(
  { params }: { params: SiteParams } // ✅ Typed as Promise
): Promise<Metadata> {
  const resolvedParams = await params;
  const store = await getStore(resolvedParams.site);

  // Safe Cast: settings is Json in DB, treat as Record for access
  const settings = (store?.settings as Record<string, string>) || {};
  const siteName = store?.name || "NimdeShop";
  const title = settings.site_title || `${siteName} | Home`;
  const description = settings.site_description || "Welcome to our online store.";

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      siteName: siteName,
      images: settings.site_logo ? [{ url: settings.site_logo }] : undefined
    }
  };
}

// 3. THE LAYOUT
export default async function SiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: SiteParams; // ✅ Typed as Promise
}>) {
  const resolvedParams = await params;
  const store = await getStore(resolvedParams.site);
  
  // Safe defaults
  const settings = (store?.settings as Record<string, string>) || {};
  const themeColor = settings.theme_color || '#f97316'; 

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store?.name || 'My Store',
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
        {/* 1. JSON-LD SCRIPT */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      
        {/* 2. THEME INJECTION */}
        <ThemeInjector color={themeColor} />

        {/* 3. MAIN CONTENT */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* 4. UTILITIES */}
        <DesktopSuggestion />
        <Toaster position="top-center" richColors />
    </>
  );
}