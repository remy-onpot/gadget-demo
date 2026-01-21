"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Store, ShoppingBag, Zap, ShieldCheck, BarChart3, Smartphone, Menu, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GetStartedButton } from "@/components/landing/GetStartedButton";

// --- ANIMATION VARIANTS ---
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } as const
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function LandingPageClient() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-blue-500/30 font-sans overflow-x-hidden">
      
      {/* 1. PROGRESS BAR */}
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[100]" />

      {/* 2. NOISE TEXTURE (The "Film" Look) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      {/* 3. FLOATING NAVBAR */}
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-32 md:pt-60 md:pb-48 px-6 overflow-hidden">
        <BackgroundBlobs />
        
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="flex justify-center">
              <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-blue-400 backdrop-blur-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Now Live in Ghana
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1 variants={fadeUp} className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[1.1]">
              Sell on WhatsApp. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
                Without the Chaos.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The professional storefront generator for the modern African merchant. 
              No payment gateways required. Just orders in your DMs.
            </motion.p>

            {/* CTA Group */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <GetStartedButton 
                text="Start Selling Now" 
                className="w-full sm:w-auto min-w-[200px] h-14 text-lg shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.6)]" 
              />
              <Link 
                href="https://demo.nimdeshop.com"
                target="_blank"
                className="w-full sm:w-auto min-w-[200px] h-14 rounded-2xl border border-white/10 flex items-center justify-center gap-2 font-bold text-slate-300 hover:bg-white/5 transition-colors"
              >
                View Demo <Store size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- BENTO GRID FEATURES --- */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Built for the <br/> WhatsApp Economy.</h2>
            <p className="text-slate-400 text-lg max-w-xl">Everything you need to look professional, simplified into a dashboard that feels like magic.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
            
            {/* Card 1: Large Span */}
            <BentoCard className="md:col-span-2 bg-gradient-to-br from-blue-900/20 to-slate-900/50">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4 text-blue-400">
                    <Smartphone size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Checkout to DM</h3>
                  <p className="text-slate-400">We replace the complex checkout form with a pre-filled WhatsApp message. Your customers love it because it's familiar.</p>
                </div>
                {/* Visual Representation */}
                <div className="mt-8 bg-[#0f172a] rounded-xl border border-white/5 p-4 max-w-sm ml-auto opacity-80 rotate-3">
                   <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"><Menu size={20}/></div>
                      <div className="text-xs text-slate-300">
                         <div className="font-bold text-white mb-1">New Order #4092</div>
                         Hello! I want to buy:<br/>1x Nike Air Max (Size 42)
                      </div>
                   </div>
                </div>
              </div>
            </BentoCard>

            {/* Card 2: Vertical */}
            <BentoCard className="md:row-span-2 bg-slate-900/50">
               <div className="h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center mb-6 text-orange-400">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Cart Sniper</h3>
                  <p className="text-slate-400 mb-8">See who abandoned their cart and recover the sale manually.</p>
                  
                  <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 space-y-3">
                     {[1,2,3].map(i => (
                       <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5">
                          <span className="text-slate-400">Cart #{200+i}</span>
                          <span className="text-red-400 font-mono">Abandoned</span>
                       </div>
                     ))}
                  </div>
               </div>
            </BentoCard>

            {/* Card 3: Standard */}
            <BentoCard>
               <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center mb-4 text-purple-400">
                  <Store size={24} />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Inventory Sync</h3>
               <p className="text-slate-400 text-sm">Hide products instantly when out of stock. Manage variants like size and color effortlessly.</p>
            </BentoCard>

            {/* Card 4: Standard */}
            <BentoCard>
               <div className="w-12 h-12 rounded-xl bg-teal-600/20 flex items-center justify-center mb-4 text-teal-400">
                  <BarChart3 size={24} />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Real Analytics</h3>
               <p className="text-slate-400 text-sm">Know your best selling products and peak shopping times.</p>
            </BentoCard>

          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section className="py-32 relative overflow-hidden">
         <div className="absolute inset-0 bg-blue-900/5 skew-y-3 transform origin-top-left -z-10" />
         
         <div className="container mx-auto px-6 max-w-4xl text-center">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight"
            >
               One Price. <br/> Unlimited Growth.
            </motion.h2>
            
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
               <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-12 md:p-16">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="text-left">
                        <div className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-sm">Pro Membership</div>
                        <div className="text-6xl font-black text-white mb-4">₵200<span className="text-2xl text-slate-500 font-bold">/mo</span></div>
                        <p className="text-slate-400 max-w-sm">Includes hosting, unlimited products, custom domain connection, and priority support.</p>
                     </div>
                     
                     <div className="h-px w-full md:w-px md:h-32 bg-white/10" />
                     
                     <div className="flex flex-col gap-4 text-left w-full md:w-auto">
                        {['Unlimited Products', '0% Transaction Fees', 'Custom Domain', 'Cart Recovery'].map((feat) => (
                           <div key={feat} className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                 <ShieldCheck size={14} className="text-blue-400" />
                              </div>
                              <span className="font-medium text-slate-200">{feat}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="mt-12 pt-10 border-t border-white/5">
                     <GetStartedButton 
                        text="Start Your 14-Day Free Trial" 
                        className="w-full h-16 text-lg bg-white text-black hover:bg-slate-200 hover:shadow-white/10" 
                     />
                     <p className="mt-4 text-xs text-slate-500">No credit card required for trial.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/5 bg-black">
         <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Store className="text-white" size={16} />
               </div>
               <span className="font-bold text-white tracking-tight">NimdeShop</span>
            </div>
            <div className="text-slate-500 text-sm">
               © {new Date().getFullYear()} NimdeShop. Built in Kumasi.
            </div>
         </div>
      </footer>

    </div>
  );
}

// --- SUB COMPONENTS ---

// 1. Navbar Component (Floating Glass)
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Simple scroll listener
  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-6 left-0 right-0 z-50 transition-all duration-300 px-6",
      isScrolled ? "max-w-4xl mx-auto" : "w-full"
    )}>
      <div className={cn(
        "flex items-center justify-between px-6 py-4 rounded-2xl border transition-all duration-300 backdrop-blur-xl",
        isScrolled 
          ? "bg-white/5 border-white/10 shadow-2xl shadow-black/50" 
          : "bg-transparent border-transparent"
      )}>
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
           <Store className="text-blue-500" /> Nimde
        </div>
        
        <div className="flex items-center gap-4">
           <Link href="/login" className="hidden md:block text-sm font-medium text-slate-300 hover:text-white transition-colors">
             Login
           </Link>
           <GetStartedButton variant="nav" text="Get Started" className="h-10 px-5 text-sm" />
        </div>
      </div>
    </nav>
  );
};

// 2. Bento Grid Card (Spotlight Effect)
const BentoCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "relative rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 overflow-hidden group hover:border-white/20 transition-colors", 
        className
      )}
    >
      <div 
        className="pointer-events-none absolute -inset-px transition duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

// 3. Animated Background Blobs
const BackgroundBlobs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
  </div>
);