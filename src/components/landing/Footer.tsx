"use client";

import React from 'react';
import { 
  Twitter, 
  Instagram, 
  Linkedin, 
  Store, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#020617] border-t border-white/5 pt-20 pb-10 font-sans text-slate-400">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
           
           {/* COL 1: BRAND IDENTITY (Span 4) */}
           <div className="md:col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    <Store size={20} />
                 </div>
                 <span className="text-2xl font-black text-white tracking-tight">Nimde<span className="font-normal text-slate-500">Shop</span></span>
              </div>
              
              <p className="text-lg leading-relaxed max-w-sm text-slate-400">
                 The operating system for modern African commerce. We help businesses sell professionally without the technical headaches.
              </p>

              <div className="flex gap-4 pt-2">
                 <SocialLink href="#" icon={<Twitter size={18} />} />
                 <SocialLink href="#" icon={<Instagram size={18} />} />
                 <SocialLink href="#" icon={<Linkedin size={18} />} />
              </div>
           </div>

           {/* COL 2: PRODUCT (Span 2) */}
           <div className="md:col-span-2">
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4">
                 <FooterLink href="#features">Features</FooterLink>
                 <FooterLink href="#pricing">Pricing</FooterLink>
                 <FooterLink href="/showcase">Store Showcase</FooterLink>
                 <FooterLink href="/login">Merchant Login</FooterLink>
                 <FooterLink href="/changelog">Changelog <span className="text-[10px] bg-blue-900/50 text-blue-400 px-1.5 py-0.5 rounded ml-2">New</span></FooterLink>
              </ul>
           </div>

           {/* COL 3: COMPANY (Span 2) */}
           <div className="md:col-span-2">
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                 <FooterLink href="/about">About Us</FooterLink>
                 <FooterLink href="/careers">Careers</FooterLink>
                 <FooterLink href="/blog">Blog</FooterLink>
                 <FooterLink href="/legal/privacy">Privacy Policy</FooterLink>
                 <FooterLink href="/legal/terms">Terms of Service</FooterLink>
              </ul>
           </div>

           {/* COL 4: CONTACT (Span 4) */}
           <div className="md:col-span-4 bg-white/5 border border-white/5 rounded-3xl p-8">
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                 <ShieldCheck className="text-blue-500" size={18}/> Contact Support
              </h4>
              
              <div className="space-y-5 text-sm">
                 <div className="flex gap-4 items-start">
                    <MapPin className="shrink-0 text-blue-500 mt-1" size={18} />
                    <span>
                       Nimde Inc<br/>
                       Accra,<br/>
                       Ghana
                    </span>
                 </div>
                 
                 <div className="flex gap-4 items-center">
                    <Mail className="shrink-0 text-blue-500" size={18} />
                    <a href="mailto:ceo@nimdeshop.com" className="hover:text-white transition-colors">ceo@nimdeshop.com</a>
                 </div>

                 <div className="flex gap-4 items-center">
                    <Clock className="shrink-0 text-blue-500" size={18} />
                    <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                 <Link href="/contact" className="text-white font-bold flex items-center gap-2 hover:gap-4 transition-all group">
                    Get in touch <ArrowRight size={16} className="text-blue-500" />
                 </Link>
              </div>
           </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-600">
           <p>© {currentYear} Nimde Inc. All rights reserved.</p>
           <div className="flex gap-6">
              <span>Status: <span className="text-green-500">Operational</span></span>
              <span>Made with shopers and owners in mind</span>
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
     className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300"
   >
     {icon}
   </a>
);

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
   <li>
      <Link href={href} className="hover:text-blue-400 transition-colors flex items-center">
         {children}
      </Link>
   </li>
);