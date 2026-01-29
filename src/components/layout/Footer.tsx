"use client";

import React from 'react';
import { 
  Facebook, Instagram, Twitter, MapPin, Phone, Mail, 
  Linkedin, Clock, CreditCard, Smartphone, ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';

interface FooterProps {
  settings: Record<string, string>;
  categories: string[];
}

export const Footer = ({ settings, categories }: FooterProps) => {
  const whatsapp = settings['whatsapp_phone'];
  const phone = settings['support_phone'];
  const address = settings['address_display'];
  const description = settings['site_description'] || "Your trusted source for premium products.";
  
  const businessHours = settings['business_hours'] || "Mon - Sat: 8:00 AM - 7:00 PM";
  const siteName = settings['site_name'] || "My Store";
  const logoUrl = settings['site_logo'];

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-20 pb-10 text-slate-400 font-sans">
      <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
           
           {/* COL 1: BRAND IDENTITY */}
           <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2 select-none w-fit">
                 {logoUrl ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img 
                     src={logoUrl} 
                     alt={siteName} 
                     className="h-8 w-auto object-contain brightness-0 invert" // Force white logo on dark footer
                   />
                 ) : (
                   <span className="font-black text-2xl tracking-tighter text-white">
                     {siteName}
                   </span>
                 )}
              </Link>

              <p className="text-sm leading-relaxed max-w-xs text-slate-400">
                 {description}
              </p>
              
              <div className="flex gap-4">
                 {settings['social_instagram'] && <SocialIcon href={settings['social_instagram']} icon={<Instagram size={18}/>} />}
                 {settings['social_twitter'] && <SocialIcon href={settings['social_twitter']} icon={<Twitter size={18}/>} />}
                 {settings['social_facebook'] && <SocialIcon href={settings['social_facebook']} icon={<Facebook size={18}/>} />}
                 {settings['social_linkedin'] && <SocialIcon href={settings['social_linkedin']} icon={<Linkedin size={18}/>} />}
              </div>
           </div>

           {/* COL 2: SHOP */}
           <div>
              <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Shop</h4>
              <ul className="space-y-3 text-sm font-medium">
                 {categories.slice(0, 6).map(cat => (
                    <li key={cat}>
                        <Link 
                            href={`/category/${cat}`} 
                            className="transition-colors capitalize block py-1 hover:opacity-100 opacity-70"
                            style={{ 
                                // We use style for hover color to match dynamic theme
                                // Note: CSS variables work best here, but for simple hover text in React, 
                                // a className is hard without 'group' or 'hover:'.
                                // A clean hack: Use a CSS variable for the hover color in a global style or inline style block.
                                // For now, we'll let it be white on hover, or use a class if we can.
                            }}
                        >
                            {/* We'll use a span to apply color on hover via inline style if needed, 
                                but standard white hover is safer for dark footers. 
                                Let's strictly use Brand Color for the "View All" link. 
                            */}
                            <span className="hover:text-white">{cat.replace(/-/g, ' ')}</span>
                        </Link>
                    </li>
                 ))}
                 <li>
                    <Link 
                        href="/search" 
                        className="transition-colors py-1 block font-bold"
                        style={{ color: 'var(--primary)' }}
                    >
                        View All Products →
                    </Link>
                 </li>
              </ul>
           </div>

           {/* COL 3: SUPPORT */}
           <div>
              <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Support</h4>
              <ul className="space-y-3 text-sm font-medium">
                 {whatsapp && (
                    <li><a href={`https://wa.me/${whatsapp}`} className="hover:text-white transition-colors block py-1">Chat on WhatsApp</a></li>
                 )}
              </ul>
           </div>

           {/* COL 4: CONTACT & TRUST */}
           <div>
              <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Contact</h4>
              <div className="space-y-4 text-sm mb-8">
                 {address && (
                    <div className="flex gap-3 items-start">
                       <MapPin className="shrink-0 mt-0.5" size={16} style={{ color: 'var(--primary)' }} />
                       <p className="whitespace-pre-line leading-relaxed">{address}</p>
                    </div>
                 )}
                 {phone && (
                    <div className="flex gap-3 items-center">
                       <Phone className="shrink-0" size={16} style={{ color: 'var(--primary)' }} />
                       <p>{phone}</p>
                    </div>
                 )}
                 <div className="flex gap-3 items-center">
                    <Clock className="shrink-0" size={16} style={{ color: 'var(--primary)' }} />
                    <p>{businessHours}</p>
                 </div>
              </div>

              {/* PAYMENT ICONS */}
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Accepted Payments</p>
                 <div className="flex gap-2">
                    <PaymentBadge icon={<Smartphone size={14} />} label="MoMo" />
                    <PaymentBadge icon={<CreditCard size={14} />} label="Card" />
                    <PaymentBadge icon={<ShieldCheck size={14} />} label="Cash" />
                 </div>
              </div>
           </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
           <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
           <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-slate-400 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-400 transition">Terms</Link>
           </div>
        </div>
      </div>
    </footer>
  );
};

// --- SUB COMPONENTS ---

const SocialIcon = ({ href, icon }: { href: string, icon: React.ReactNode }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center text-slate-400 transition-all duration-300 hover:text-white hover:scale-110"
      style={{ 
          // We can't easily hover-style with dynamic vars without CSS-in-JS or advanced Tailwind config.
          // Fallback: Standard white hover for icons on dark bg looks cleaner than dynamic colors anyway.
      }}
    >
      {icon}
    </a>
);

const PaymentBadge = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="h-8 px-3 rounded border border-white/10 bg-white/5 flex items-center gap-1.5 text-xs font-bold text-slate-300" title={label}>
       {icon} <span>{label}</span>
    </div>
);