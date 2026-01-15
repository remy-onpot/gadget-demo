import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Components
import { DesktopSuggestion } from '@/components/shop/DesktopSuggestion';
import { Toaster } from 'sonner';

// Data Service
import { getGlobalData } from '@/lib/services/global';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// ✅ DYNAMIC METADATA (Still Global)
export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getGlobalData();

  const siteName = settings['site_name'] || "My Store";
  const title = settings['site_title'] || `${siteName} | Home`;
  const description = settings['site_description'] || "Welcome to our online store.";

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      siteName: siteName,
      images: settings['site_logo'] ? [{ url: settings['site_logo'] }] : undefined
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // We still need settings for SEO (above), but not for rendering HTML here.
  // The JSON-LD can stay here as it helps SEO globally.
  const { settings } = await getGlobalData();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: settings['site_name'] || 'My Store',
    image: settings['site_logo'],
    description: settings['site_description'],
    telephone: settings['support_phone'],
    address: {
        '@type': 'PostalAddress',
        streetAddress: settings['address_display'] || 'Online Store',
        addressCountry: 'GH'
    },
    openingHours: settings['business_hours'] || "Mo-Sa 09:00-18:00", 
    url: settings['site_url'] || 'https://example.com' 
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-orange-900">
        
        {/* ❌ HEADER REMOVED (Moved to page.tsx) */}
        
        <main className="min-h-screen">
          {children}
        </main>

        {/* ❌ FOOTER REMOVED (Moved to page.tsx) */}
        
        <DesktopSuggestion />
        <Toaster position="top-center" richColors />
        
      </body>
    </html>
  );
}