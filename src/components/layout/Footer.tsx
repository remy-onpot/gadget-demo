"use client";

import React from 'react';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Linkedin, Clock } from 'lucide-react';
import Link from 'next/link';

interface FooterProps {
  settings: Record<string, string>;
  categories: string[];
}

export const Footer = ({ settings, categories }: FooterProps) => {
  const whatsapp = settings['whatsapp_phone'];
  const phone = settings['support_phone'];
  const email = settings['support_email'];
  const address = settings['address_display'];
  const description = settings['site_description'] || "Your trusted source for premium products.";
  
  // ✅ 1. DYNAMIC BUSINESS HOURS
  // If the admin hasn't set this yet, fallback to standard times
  const businessHours = settings['business_hours'] || "Mon - Sat: 8:00 AM - 7:00 PM";

  // ✅ 2. LOGO LOGIC
  const siteName = settings['site_name'] || "My Store";
  const logoUrl = settings['site_logo'];

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-10">
      <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-16">
           
           {/* COL 1: BRAND */}
           <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2 select-none w-fit">
                 {logoUrl ? (
                   <img 
                     src={logoUrl} 
                     alt={siteName} 
                     className="h-8 w-auto object-contain" 
                   />
                 ) : (
                   <span className="font-black text-2xl tracking-tighter text-slate-900">
                     {siteName}
                   </span>
                 )}
              </Link>

              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                 {description}
              </p>
              
              <div className="flex gap-4">
                 {/* ... Social Icons (Same as before) ... */}
                 {settings['social_instagram'] && (
                    <a href={settings['social_instagram']} target="_blank" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><Instagram size={18}/></a>
                 )}
                 {settings['social_twitter'] && (
                    <a href={settings['social_twitter']} target="_blank" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><Twitter size={18}/></a>
                 )}
                 {settings['social_facebook'] && (
                    <a href={settings['social_facebook']} target="_blank" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><Facebook size={18}/></a>
                 )}
              </div>
           </div>

           {/* COL 2: SHOP (Same as before) */}
           <div>
              <h4 className="font-bold text-slate-900 mb-6">Shop Categories</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                 {categories.slice(0, 5).map(cat => (
                    <li key={cat}>
                        <Link href={`/category/${cat}`} className="hover:text-orange-600 transition capitalize">
                            {cat}s
                        </Link>
                    </li>
                 ))}
                 <li><Link href="/search" className="hover:text-orange-600 transition">Browse All</Link></li>
              </ul>
           </div>

           {/* COL 3: SUPPORT (Same as before) */}
           <div>
              <h4 className="font-bold text-slate-900 mb-6">Customer Support</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                 <li><Link href="/track-order" className="hover:text-orange-600 transition">Track My Order</Link></li>
                 <li><Link href="/warranty" className="hover:text-orange-600 transition">Warranty Policy</Link></li>
                 <li><Link href="/faqs" className="hover:text-orange-600 transition">FAQs</Link></li>
                 {whatsapp && (
                    <li><a href={`https://wa.me/${whatsapp}`} className="hover:text-orange-600 transition">Chat on WhatsApp</a></li>
                 )}
              </ul>
           </div>

           {/* COL 4: CONTACT (Updated with Dynamic Hours) */}
           <div>
              <h4 className="font-bold text-slate-900 mb-6">Contact Us</h4>
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
                 {/* ✅ DYNAMIC HOURS */}
                 <div className="flex gap-3 items-center">
                    <Clock className="shrink-0 text-orange-500" size={18} />
                    <p>{businessHours}</p>
                 </div>
              </div>
           </div>

        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
           <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
           <p className="opacity-50 hover:opacity-100 transition-opacity">Powered by GadgetOS</p>
        </div>
      </div>
    </footer>
  );
};