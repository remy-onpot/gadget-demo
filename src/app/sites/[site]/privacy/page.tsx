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
    title: `Privacy Policy | ${site}`,
    robots: 'noindex, nofollow',
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { site } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, settings')
    .eq('slug', site)
    .single();

  if (!store) return notFound();

  const { categories, settings } = await getGlobalData(store.id);
  const storeName = store.name;
  const contactEmail = settings['support_email'] || 'privacy@nimdeshop.com';

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      <Header settings={settings} categories={categories} />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900">
            <p className="lead">
              At <strong>{storeName}</strong>, we value your privacy and are committed to protecting your personal information. 
              This policy explains how we collect, use, and share your data.
            </p>

            <h3>1. Information We Collect</h3>
            <p>
              When you visit the Site, we automatically collect certain information about your device, including your web browser, IP address, and time zone. 
              Additionally, as you browse the Site, we collect information about the individual web pages or products that you view.
            </p>
            <p>
              <strong>Order Information:</strong> When you make a purchase, we collect certain information from you, including your name, 
              billing address, shipping address, and phone number.
            </p>

            <h3>2. How We Use Your Information</h3>
            <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including arranging for shipping and providing you with invoices and/or order confirmations).</p>

            <h3>3. Sharing Your Personal Information</h3>
            <p>
              We share your Personal Information with third parties to help us use your Personal Information, as described above. 
              For example, we use <strong>NimdeShop</strong> to power our online store.
            </p>

            <h3>4. Data Retention</h3>
            <p>
              When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
            </p>

            <h3>5. Changes</h3>
            <p>
              We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.
            </p>

            <h3>6. Contact Us</h3>
            <p>
              For more information about our privacy practices, or if you have questions, please contact us by e-mail at <strong>{contactEmail}</strong>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}