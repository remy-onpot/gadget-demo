"use client";

import React from 'react';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Linkedin } from 'lucide-react';
import Link from 'next/link';

export const Footer = ({ settings }: { settings: Record<string, string> }) => {
  const whatsapp = settings['whatsapp_phone'];
  const phone = settings['support_phone'];
  const email = settings['support_email'];
  const address = settings['address_display'];

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-10">
      <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-16">
           
           {/* COL 1: BRAND (UPDATED LOGO) */}
           <div className="space-y-6">
              {/* THE CORRECT LOGO MATCHING HEADER */}
              <Link href="/" className="flex items-center gap-0.5 select-none w-fit">
                 <span className="font-black text-2xl tracking-tighter text-[#00AEEF]">
                   Payless
                 </span>
                 <span className="bg-[#F7931E] text-white px-1.5 py-0.5 font-black text-2xl tracking-tighter leading-none -mb-1">
                   4tech
                 </span>
              </Link>

              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                 Ghana's most trusted source for premium UK Used laptops, gaming consoles, and accessories. Quality you can verify, prices you can afford.
              </p>
              
              <div className="flex gap-4">
                 {settings['social_instagram'] && (
                    <a href={settings['social_instagram']} target="_blank" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><Instagram size={18}/></a>
                 )}
                 {settings['social_twitter'] && (
                    <a href={settings['social_twitter']} target="_blank" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><Twitter size={18}/></a>
                 )}
                 {settings['social_facebook'] && (
                    <a href={settings['social_facebook']} target="_blank" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><Facebook size={18}/></a>
                 )}
                 {settings['social_linkedin'] && (
                    <a href={settings['social_linkedin']} target="_blank" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><Linkedin size={18}/></a>
                 )}
              </div>
           </div>

           {/* COL 2: SHOP */}
           <div>
              <h4 className="font-bold text-slate-900 mb-6">Shop Categories</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                 <li><Link href="/category/laptop" className="hover:text-orange-600 transition">Business Laptops</Link></li>
                 <li><Link href="/category/gaming" className="hover:text-orange-600 transition">Gaming Consoles</Link></li>
                 <li><Link href="/category/phone" className="hover:text-orange-600 transition">Smartphones</Link></li>
                 <li><Link href="/category/audio" className="hover:text-orange-600 transition">Audio & Sound</Link></li>
              </ul>
           </div>

           {/* COL 3: SUPPORT */}
           <div>
              <h4 className="font-bold text-slate-900 mb-6">Customer Support</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                 <li><Link href="/track-order" className="hover:text-orange-600 transition">Track My Order</Link></li>
                 <li><Link href="/warranty" className="hover:text-orange-600 transition">Warranty Policy</Link></li>
                 <li><Link href="/faqs" className="hover:text-orange-600 transition">FAQs</Link></li>
                 {whatsapp && (
                    <li><a href={`https://wa.me/${whatsapp}`} className="hover:text-orange-600 transition">Contact Us</a></li>
                 )}
              </ul>
           </div>

           {/* COL 4: VISIT US */}
           <div>
              <h4 className="font-bold text-slate-900 mb-6">Visit Our Branch</h4>
              <div className="space-y-4 text-sm text-slate-500">
                 {address && (
                    <div className="flex gap-3 items-start">
                        <MapPin className="shrink-0 text-orange-500 mt-1" size={18} />
                        <p className="whitespace-pre-line leading-relaxed">{address}</p>
                    </div>
                 )}
                 {phone && (
                    <div className="flex gap-3 items-center">
                        <Phone className="shrink-0 text-orange-500" size={18} />
                        <p>{phone}</p>
                    </div>
                 )}
                 {email && (
                    <div className="flex gap-3 items-center">
                        <Mail className="shrink-0 text-orange-500" size={18} />
                        <p>{email}</p>
                    </div>
                 )}
              </div>
           </div>

        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
           <p>&copy; {new Date().getFullYear()} Payless4Tech Ghana. All rights reserved.</p>
           <p>Built with ❤️ in Accra.</p>
        </div>
      </div>
    </footer>
  );
};