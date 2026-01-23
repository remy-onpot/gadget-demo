"use client";

import React from 'react';
import { 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Store // Added icon for showcase
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#020617] border-t border-white/5 pt-20 pb-10 font-sans text-slate-400">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
           
           {/* COL 1: BRAND IDENTITY (Span 4) */}
           <div className="md:col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                 {/* 1. LOGO IMAGE */}
                 <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0">
                    <Image 
                       src="/logo.svg" 
                       alt="NimdeShop Logo" 
                       fill 
                       className="object-contain"
                    />
                 </div>
                 
                 {/* 2. TEXT LOGO */}
                 <span className="text-2xl font-black text-white tracking-tight flex items-baseline">
                   Nimde<span className="text-green-500 ml-[1px]">Shop</span>
                 </span>
              </div>
              
              <p className="text-lg leading-relaxed max-w-sm text-slate-400">
                 The operating system for modern African commerce. We help businesses sell professionally without the technical headaches.
              </p>

              <div className="flex gap-4 pt-2">
                 <SocialLink href="https://twitter.com" icon={<Twitter size={18} />} />
                 <SocialLink href="https://instagram.com" icon={<Instagram size={18} />} />
                 <SocialLink href="https://linkedin.com" icon={<Linkedin size={18} />} />
              </div>
           </div>

           {/* COL 2: PRODUCT (Span 2) */}
           <div className="md:col-span-2">
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4">
                 {/* ✅ Updated to absolute anchors so they work from other pages */}
                 <FooterLink href="/#features">Features</FooterLink>
                 <FooterLink href="/#pricing">Pricing</FooterLink>
                 
                 {/* ✅ Points to the Demo Store we built */}
                 <li>
                    <Link href="/sites/demo" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                       <Store size={14} className="text-green-500" /> Demo Store
                    </Link>
                 </li>
                 
                 <FooterLink href="/admin/login">Merchant Login</FooterLink>
              </ul>
           </div>

           {/* COL 3: COMPANY (Span 2) */}
           <div className="md:col-span-2">
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                 {/* These can remain as placeholders or link to real pages */}
                 <FooterLink href="/about">About Us</FooterLink>
                 <FooterLink href="/careers">Careers</FooterLink>
                 <FooterLink href="/legal/privacy">Privacy Policy</FooterLink>
                 <FooterLink href="/legal/terms">Terms of Service</FooterLink>
              </ul>
           </div>

           {/* COL 4: CONTACT (Span 4) */}
           <div className="md:col-span-4 bg-white/5 border border-white/5 rounded-3xl p-8">
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                 <ShieldCheck className="text-green-500" size={18}/> Contact Support
              </h4>
              
              <div className="space-y-5 text-sm">
                 <div className="flex gap-4 items-start">
                    <MapPin className="shrink-0 text-green-500 mt-1" size={18} />
                    <span>
                       Nimde Inc<br/>
                       Accra, Ghana
                    </span>
                 </div>
                 
                 <div className="flex gap-4 items-center">
                    <Mail className="shrink-0 text-green-500" size={18} />
                    <a href="mailto:ceo@nimdeshop.com" className="hover:text-white transition-colors">ceo@nimdeshop.com</a>
                 </div>

                 <div className="flex gap-4 items-center">
                    <Clock className="shrink-0 text-green-500" size={18} />
                    <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                 <Link href="mailto:ceo@nimdeshop.com" className="text-white font-bold flex items-center gap-2 hover:gap-4 transition-all group">
                    Get in touch <ArrowRight size={16} className="text-green-500" />
                 </Link>
              </div>
           </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-600">
           <p>© {currentYear} Nimde Inc. All rights reserved.</p>
           <div className="flex gap-6">
              <span>Status: <span className="text-green-500">Operational</span></span>
              <span>Made in Accra 🇬🇭</span>
           </div>
        </div>

      </div>
    </footer>
  );
};

// --- SUB COMPONENTS ---

const SocialLink = ({ href, icon }: { href: string, icon: React.ReactNode }) => (
   <a 
     href={href} 
     target="_blank" 
     rel="noopener noreferrer"
     className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-green-600 hover:text-white hover:border-green-500 transition-all duration-300"
   >
     {icon}
   </a>
);

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
   <li>
      <Link href={href} className="hover:text-green-400 transition-colors flex items-center">
         {children}
      </Link>
   </li>
);