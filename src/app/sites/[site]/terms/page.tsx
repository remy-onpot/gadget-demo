import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { Header } from '@/components/layout/Header';
import { getGlobalData } from '@/lib/services/global';

interface Props {
  params: Promise<{ site: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site } = await params;
  return {
    title: `Terms of Service | ${site}`,
    robots: 'noindex, nofollow', // Good practice for duplicate legal content
  };
}

export default async function TermsPage({ params }: Props) {
  const { site } = await params;
  const supabase = await createClient();

  // 1. Fetch Store Details
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, settings')
    .eq('slug', site)
    .single();

  if (!store) return notFound();

  // 2. Fetch Global Data for Header
  const { categories, settings } = await getGlobalData(store.id);
  
  const storeName = store.name;
  const contactEmail = settings['support_email'] || 'support@nimdeshop.com';
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      <Header settings={settings} categories={categories} />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-500 font-medium mb-8">Last Updated: {lastUpdated}</p>

          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600">
            <h3>1. Introduction</h3>
            <p>
              Welcome to <strong>{storeName}</strong>. By accessing or using our website, you agree to be bound by these Terms of Service. 
              Please read them carefully before making a purchase.
            </p>

            <h3>2. Platform Disclaimer</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-xl">
              <p className="text-sm text-blue-800 m-0">
                <strong>Notice:</strong> This store is powered by <strong>NimdeShop</strong> ("The Platform"). 
                The Platform provides the technical infrastructure for {storeName} to operate but is not the seller of record. 
                All purchases, fulfillment, and customer service disputes are solely between you (the Buyer) and {storeName} (the Merchant).
              </p>
            </div>

            <h3>3. Purchases & Payments</h3>
            <p>
              When you make a purchase on {storeName}, you agree to provide current, complete, and accurate purchase and account information. 
              We reserve the right to refuse any order you place with us.
            </p>

            <h3>4. Shipping & Returns</h3>
            <p>
              Shipping policies and return windows are set specifically by {storeName}. 
              Please review the specific shipping information provided at checkout. 
              The Platform is not responsible for lost packages or delivery delays.
            </p>

            <h3>5. Limitation of Liability</h3>
            <p>
              To the fullest extent permitted by law, neither {storeName} nor the Platform provider shall be liable for any indirect, incidental, 
              or consequential damages arising from your use of the service or any products procured using the service.
            </p>

            <h3>6. Contact Information</h3>
            <p>
              Questions about the Terms of Service should be sent to us at: <br/>
              <strong>{contactEmail}</strong>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}