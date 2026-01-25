import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getGlobalData } from '@/lib/services/global';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

interface Props {
  params: Promise<{ site: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site } = await params;
  return { title: `Contact Us | ${site}` };
}

export default async function ContactPage({ params }: Props) {
  const { site } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase.from('stores').select('id').eq('slug', site).single();
  if (!store) return notFound();

  const { settings } = await getGlobalData(store.id);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Get in Touch</h1>
        <p className="text-slate-500 font-medium mb-12 max-w-lg mx-auto">
          Have questions about our products or need assistance with an order? We're here to help!
        </p>

        <div className="grid md:grid-cols-2 gap-8 text-left">
           {/* Phone */}
           <div className="bg-slate-50 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3 text-slate-900 font-bold">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600"><Phone size={20}/></div>
                 Phone Support
              </div>
              <p className="text-slate-600 pl-13">{settings.support_phone || 'Not available'}</p>
           </div>

           {/* Email */}
           <div className="bg-slate-50 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3 text-slate-900 font-bold">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600"><Mail size={20}/></div>
                 Email Us
              </div>
              <p className="text-slate-600 pl-13">{settings.support_email || 'Not available'}</p>
           </div>

           {/* Address */}
           <div className="bg-slate-50 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3 text-slate-900 font-bold">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600"><MapPin size={20}/></div>
                 Visit Us
              </div>
              <p className="text-slate-600 pl-13 whitespace-pre-line">{settings.address_display || 'Online Only'}</p>
           </div>

           {/* Hours */}
           <div className="bg-slate-50 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3 text-slate-900 font-bold">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600"><Clock size={20}/></div>
                 Business Hours
              </div>
              <p className="text-slate-600 pl-13">{settings.business_hours || '24/7 Online'}</p>
           </div>
        </div>
      </div>
    </div>
  );
}