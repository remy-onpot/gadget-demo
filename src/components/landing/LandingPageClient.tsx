"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, Variants } from "framer-motion";
import { 
  ArrowRight, Store, ShoppingBag, Zap, ShieldCheck, BarChart3, 
  Smartphone, Menu, Globe, CreditCard, MessageSquare, CheckCircle2, 
  Plus
} from "lucide-react";
import Link from "next/link";
import Image from "next/image"; 
import { cn } from "@/lib/utils";
import { GetStartedButton } from "@/components/landing/GetStartedButton";
import { Footer } from "@/components/landing/Footer"; 
import { StoreSearch } from '@/components/landing/StoreSearch'; 

// --- ANIMATION VARIANTS ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } 
  }
};

const staggerContainer: Variants = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function LandingPageClient() {
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Parallax Physics
  const heroY = useTransform(scrollY, [0, 1000], [0, 200]); 
  const textY = useTransform(scrollY, [0, 1000], [0, 400]); 

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden selection:bg-blue-500/30">
      
      {/* CSS to hide scrollbar for clean slider look */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {/* 1. SCROLL PROGRESS */}
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[100]" />

      {/* 2. ATMOSPHERE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
         <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* 3. NAVBAR */}
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        {/* 3D Silhouettes */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0 flex items-center justify-center opacity-70 md:opacity-80 pointer-events-none mix-blend-screen">
           <div className="absolute bottom-0 right-[-5%] w-[45%] h-[75%]">
              <Image src="/hero-man.png" alt="Man" fill className="object-contain object-bottom drop-shadow-[0_0_50px_rgba(59,130,246,0.3)]" priority />
           </div>
           <div className="absolute bottom-0 left-[-5%] w-[45%] h-[95%]">
              <Image src="/hero-woman.png" alt="Woman" fill className="object-contain object-bottom drop-shadow-[0_0_50px_rgba(37,211,102,0.2)]" priority />
           </div>
        </motion.div>

        {/* Floor Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#020617] to-transparent z-10" />

        {/* Hero Content */}
        <div className="container mx-auto max-w-5xl relative z-20 text-center">
          <motion.div style={{ y: textY }} initial="hidden" animate="visible" variants={staggerContainer} className="space-y-10">
            <motion.div variants={fadeUp} className="flex justify-center">
              <span className="px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-xs font-bold text-blue-400 backdrop-blur-md flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[1.05] drop-shadow-2xl">
              A Better Way to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-[#25D366]">sell and Shop.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              NimdeShop gives businesses a professional online store that turns product views into closed deals. 
              <span className="text-slate-200 block mt-2">No payment gateways. No tech headaches. start with ₵0 today.</span>
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
              <GetStartedButton text="Own a Store For ₵175/mo" className="w-full sm:w-auto min-w-[240px] h-16 text-lg bg-blue-600 hover:bg-blue-500 border-t border-white/20" />
              <Link href="https://demo.nimdeshop.com" target="_blank" className="w-full sm:w-auto min-w-[200px] h-16 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center gap-2 font-bold text-slate-200 hover:bg-white/10 transition-all shadow-lg group">
                View Demo Store <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    

      {/* --- VALUE PROP (Horizontal Slide on Mobile) --- */}
      <section className="py-32 relative z-10 bg-[#020617]">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Modified Container: Flex/Scroll on Mobile, Grid on Desktop */}
          <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 md:grid md:grid-cols-2 md:gap-8 lg:gap-12 md:pb-0 md:mx-0 md:px-0 scrollbar-hide">
            
            <BentoCard className="min-w-[85vw] snap-center md:min-w-0 bg-gradient-to-br from-blue-900/10 to-transparent border-blue-500/10 hover:border-blue-500/30">
               <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-8 text-blue-400 shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]"><Store size={28} /></div>
               <h3 className="text-3xl font-bold text-white mb-4">For Business Owners</h3>
               <p className="text-slate-400 text-lg mb-8 leading-relaxed">Stop losing sales in chaotic DM threads. Get a system that tracks orders, manages stock, and looks professional.</p>
               <ul className="space-y-4">
                  <CheckItem text="Look Professional Instantly" color="blue" />
                  <CheckItem text="Track Every Order & Customer" color="blue" />
                  <CheckItem text="No Payment Gateway Fees" color="blue" />
               </ul>
            </BentoCard>

            <BentoCard className="min-w-[85vw] snap-center md:min-w-0 bg-gradient-to-br from-[#25D366]/5 to-transparent border-[#25D366]/10 hover:border-[#25D366]/30">
               <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mb-8 text-[#25D366] shadow-[0_0_30px_-10px_rgba(37,211,102,0.3)]"><ShoppingBag size={28} /></div>
               <h3 className="text-3xl font-bold text-white mb-4">For Your Customers</h3>
               <p className="text-slate-400 text-lg mb-8 leading-relaxed">Give them the shopping experience they expect. Clear prices, high-quality images, and a cart that works.</p>
               <ul className="space-y-4">
                  <CheckItem text="Shop Without Pressure" color="green" />
                  <CheckItem text="Add-to-Cart Simplicity" color="green" />
                  <CheckItem text="One-Click WhatsApp Checkout" color="green" />
               </ul>
            </BentoCard>

          </div>
        </div>
      </section>

      {/* --- BENTO GRID FEATURES (Horizontal Slide on Mobile) --- */}
      <section id="features" className="py-24 bg-slate-900/20 border-y border-white/5 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Powerful Tools. Zero Complexity.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Everything you need to run a modern business, stripped of the bloat.
              Turn your business into a real e-commerce powerhouse in minutes with tools designed for shopers and owners alike.
            </p>
          </div>

          {/* Modified Container: Flex/Scroll on Mobile, Grid on Desktop */}
          <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 md:grid md:grid-cols-3 md:auto-rows-[minmax(320px,auto)] md:pb-0 md:mx-0 md:px-0 scrollbar-hide">
            
            <BentoCard className="min-w-[85vw] snap-center md:min-w-0 md:col-span-2 bg-gradient-to-br from-slate-900 to-[#050a15]">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4 text-blue-400"><Smartphone size={24} /></div>
                  <h3 className="text-2xl font-bold text-white mb-2">Checkout to DM</h3>
                  <p className="text-slate-400 max-w-md">Get Whatsapp orders without chaos. We replace the complex checkout form with a pre-filled WhatsApp message. Your customers love it because it's familiar.</p>
                </div>
                <div className="mt-8 ml-auto max-w-md relative bg-[#121b2e] rounded-xl border border-white/5 p-4 shadow-2xl shadow-black/50 rotate-1">
                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-black shadow-lg"><Menu size={20}/></div>
                      <div className="bg-white/5 p-4 rounded-tr-2xl rounded-b-2xl text-xs text-slate-300 flex-1 border border-white/5">
                         <div className="font-bold text-white mb-1">New Order #4092</div>Hello! I want to buy:<br/>1x Nike Air Max (Size 42) - ₵450
                      </div>
                   </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard className="min-w-[85vw] snap-center md:min-w-0 md:row-span-2 bg-[#0a0a0a]">
               <div className="h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center mb-6 text-orange-400"><Zap size={24} /></div>
                  <h3 className="text-2xl font-bold text-white mb-2">Cart Sniper</h3>
                  <p className="text-slate-400 mb-8">See who abandoned their cart and what products get to cart but don't complete checkout, know why 
                   and recover the sale manually.</p>
                  <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 space-y-3">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/[0.02]">
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><span className="text-slate-400">Cart #{200+i}</span></div><span className="text-red-400 font-mono">Abandoned</span>
                       </div>
                     ))}
                  </div>
               </div>
            </BentoCard>

            <FeatureCard 
                className="min-w-[85vw] snap-center md:min-w-0" 
                title="Full Admin Control & Inventory Sync" 
                desc="Change anything at anytime. Hide products instantly when out of stock." 
                icon={<Store size={24} className="text-purple-400"/>} 
                bg="bg-purple-900/20" 
            />
            <FeatureCard 
                className="min-w-[85vw] snap-center md:min-w-0" 
                title="Order Tracking & Analytics" 
                desc="Every order is saved: customer details, products, and timestamps. Know your best selling products and peak times." 
                icon={<BarChart3 size={24} className="text-teal-400"/>} 
                bg="bg-teal-900/20" 
            />
            <FeatureCard 
                className="min-w-[85vw] snap-center md:min-w-0" 
                title="Product Inspection and Verified Reviews" 
                desc="Buyers get to inspect products in a 360° view. Only verified buyers can leave reviews." 
                icon={<ShieldCheck size={24} className="text-blue-400"/>} 
                bg="bg-blue-900/20" 
            />
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-32 bg-[#020617] border-t border-white/5">
         <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Common Questions</h2>
               <p className="text-slate-400">Everything you need to know about setting up.</p>
            </div>
            <div className="space-y-4">
               <FAQItem question="Do I need a domain name?" answer="No! We provide a free nimdeshop.com subdomain. You can also connect your own custom domain anytime." />
               <FAQItem question="How do I get paid?" answer="We don't touch your money. Customers pay you directly via Mobile Money or Cash on Delivery, just like a normal WhatsApp trade." />
               <FAQItem question="Can I use this on my phone?" answer="Yes. NimdeShop is mobile-first. You can build, manage, and sell entirely from your smartphone." />
               <FAQItem question="Is there a free trial?" answer="Yes! You get 7 days to build your store and make sales before paying a cedi." />
            </div>
         </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-32 relative overflow-hidden">
         <div className="absolute inset-0 bg-blue-900/10 skew-y-3 transform origin-top-left -z-10" />
         <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Pricing That Makes Sense.</h2>
            <div className="relative group mx-auto max-w-2xl">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-[#25D366] rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition duration-1000" />
               <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-12 md:p-16 shadow-2xl">
                  <div className="text-blue-400 font-bold mb-2 uppercase tracking-widest text-xs">Standard Plan</div>
                  <div className="text-7xl font-black text-white mb-6">₵175<span className="text-2xl text-slate-500 font-bold">/mo</span></div>
                  <div className="grid grid-cols-2 gap-4 text-left max-w-sm mx-auto mb-10">
                      {['Unlimited Products', 'Custom Domain', 'Cart Recovery', 'Analytics'].map(f => (
                        <div key={f} className="flex items-center gap-2"><CheckCircle2 className="text-white shrink-0" size={16}/><span className="text-slate-300 text-sm">{f}</span></div>
                      ))}
                  </div>
                  <GetStartedButton text="Start Your Free Trial" className="w-full h-16 text-lg bg-black text-black hover:bg-slate-500" />
               </div>
            </div>
         </div>
      </section>

      {/* --- 4. FOOTER COMPONENT --- */}
      <Footer /> 

    </div>
  );
}

// --- SUB COMPONENTS (Navbar, Cards) ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
      isScrolled ? "py-2 px-2 md:py-4 md:px-0 flex justify-center" : "py-0 px-0"
    )}>
      <nav className={cn(
        "flex items-center justify-between transition-all duration-500 gap-3",
        isScrolled 
          // Scrolled: Lighter Grey (Slate-900) instead of Black
          ? "w-full max-w-4xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl rounded-2xl px-4 py-3 md:px-6" 
          // Top: Even Lighter Grey (Slate-800) for better visibility
          : "w-full h-24 bg-slate-800/80 border-b border-white/5 backdrop-blur-md px-4 md:px-6" 
      )}>
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-2 group cursor-pointer shrink-0">
           
           {/* 1. CUSTOM SVG LOGO */}
           {/* Removed white box. Increased size significantly to w-14 (56px) / w-16 (64px) */}
           <div className="relative w-14 h-14 md:w-16 md:h-16 group-hover:scale-105 transition-transform shrink-0">
              <Image 
                src="/logo.svg" 
                alt="NimdeShop Logo" 
                fill 
                className="object-contain" // Removed padding to maximize size
                priority
              />
           </div>
           
           {/* 2. BRAND NAME */}
           <div className="hidden md:flex flex-col leading-none justify-center">
              <span className="text-xl font-black tracking-tight text-white flex items-baseline">
                  Nimde<span className="text-green-500 ml-[1px]">Shop</span>
              </span>
           </div>
        </div>

        {/* MIDDLE LINKS (Desktop Only) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300 shrink-0">
           <Link href="#features" className="hover:text-white transition-colors">Features</Link>
           <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>

        {/* SEARCH BAR */}
        <div className="flex-1 md:flex-none flex justify-end md:w-auto min-w-0">
           <div className="w-full max-w-[260px] md:max-w-xs md:w-[240px]">
              <StoreSearch variant="minimal" className="w-full" />
           </div>
        </div>

      </nav>
    </div>
  );
};


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
    <div ref={divRef} onMouseMove={handleMouseMove} onMouseEnter={() => setOpacity(1)} onMouseLeave={() => setOpacity(0)} className={cn("relative rounded-[2rem] border border-white/10 bg-[#080c14] p-10 overflow-hidden group hover:border-white/20 transition-all duration-500", className)}>
      <div className="pointer-events-none absolute -inset-px transition duration-500 opacity-0 group-hover:opacity-100" style={{ background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.04), transparent 40%)` }} />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

// Updated FeatureCard to accept className for mobile sizing/snapping
const FeatureCard = ({ title, desc, icon, bg, className }: { title: string, desc: string, icon: React.ReactNode, bg: string, className?: string }) => (
   <BentoCard className={className}>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", bg)}>{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{desc}</p>
   </BentoCard>
);

const CheckItem = ({ text, color }: { text: string, color: 'blue' | 'green' | 'white' }) => {
   const colors = { blue: "text-blue-500", green: "text-[#25D366]", white: "text-white" };
   return (
      <li className="flex items-center gap-3">
         <CheckCircle2 className={cn("shrink-0", colors[color])} size={20} />
         <span className="text-slate-300 font-medium">{text}</span>
      </li>
   );
};

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <div onClick={() => setIsOpen(!isOpen)} className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl overflow-hidden transition-all cursor-pointer">
         <div className="p-6 flex items-center justify-between">
            <h3 className="font-bold text-white text-lg">{question}</h3>
            <div className={cn("bg-white/10 p-2 rounded-full transition-transform duration-300", isOpen ? "rotate-45" : "rotate-0")}><Plus size={16} className="text-blue-400" /></div>
         </div>
         <div className={cn("px-6 text-slate-400 leading-relaxed overflow-hidden transition-all duration-300", isOpen ? "pb-6 max-h-40 opacity-100" : "max-h-0 opacity-0")}>{answer}</div>
      </div>
   );
};

const LogoPlaceholder = ({text, icon}: any) => (
   <div className="flex items-center gap-3 font-bold text-xl text-slate-300">
      {icon} {text}
   </div>
);