import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getGlobalData } from '@/lib/services/global';

interface Props {
  params: Promise<{ site: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site } = await params;
  return {
    title: `Terms of Service | ${site}`,
    robots: 'noindex, nofollow', // Prevent duplicate content issues with SEO
  };
}

export default async function TermsPage({ params }: Props) {
  const { site } = await params;
  const supabase = await createClient();

  // 1. Fetch Store Identity
  const { data: store } = await supabase
    .from('stores')
    .select('id, name')
    .eq('slug', site)
    .single();

  if (!store) return notFound();

  // 2. Fetch Settings (for Support Email)
  const { settings } = await getGlobalData(store.id);
  
  const storeName = store.name;
  const supportEmail = settings['support_email'] || 'support@nimdeshop.com';
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 font-medium mb-8">Last Updated: {lastUpdated}</p>

        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600 prose-p:leading-relaxed">
          <h3>1. Introduction</h3>
          <p>
            Welcome to <strong>{storeName}</strong>. By accessing or using our website, you agree to be bound by these Terms of Service and our Privacy Policy. 
            If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
          </p>

          <h3>2. Platform Disclaimer</h3>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-xl not-prose">
            <p className="text-sm text-blue-900 m-0 leading-relaxed">
              <strong>Notice:</strong> This store is powered by <strong>NimdeShop</strong> ("The Platform"). 
              The Platform provides the technical infrastructure for {storeName} to operate but is not the seller of record. 
              All purchases, fulfillment, shipping, and customer service disputes are solely between you (the Buyer) and {storeName} (the Merchant).
            </p>
          </div>

          <h3>3. Purchases & Payments</h3>
          <p>
            You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. 
            We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order.
          </p>

          <h3>4. Shipping & Returns</h3>
          <p>
            Shipping policies, delivery timelines, and return windows are established specifically by {storeName}. 
            Please review the shipping information provided at checkout before finalizing your order. 
            The Platform is not responsible for lost packages, customs fees, or delivery delays.
          </p>

          <h3>5. Accuracy of Information</h3>
          <p>
            We are not responsible if information made available on this site is not accurate, complete, or current. 
            The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions.
          </p>

          <h3>6. Limitation of Liability</h3>
          <p>
            To the fullest extent permitted by law, neither {storeName} nor the Platform provider shall be liable for any injury, loss, claim, or any direct, indirect, incidental, 
            punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, 
            replacement costs, or any similar damages.
          </p>

          <h3>7. Governing Law</h3>
          <p>
            These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of Ghana.
          </p>

          <h3>8. Contact Information</h3>
          <p>
            Questions about the Terms of Service should be sent to us at: <br/>
            <strong><a href={`mailto:${supportEmail}`}>{supportEmail}</a></strong>
          </p>
        </div>
      </div>
    </div>
  );
}