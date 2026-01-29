"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { submitExpertRequest, fetchActiveExperts } from './actions';
import { 
  CheckCircle, Loader2, Sparkles, LayoutTemplate, 
  Package, Rocket, ShieldCheck, ArrowRight, Clock, CheckCircle2, Star, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

type Expert = {
  id: string;
  name: string;
  bio: string | null;
  specialties: string[];
  avatar_url: string | null;
  jobs_completed: number;
  rating: number;
};

export default function ExpertsPage() {
  const { storeId, loading } = useAdminData();
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState('');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Service packages with pricing
  const PACKAGES = {
    setup: { title: 'Full Store Setup', price: 250, platformFee: 50, expertPayout: 200 },
    products: { title: 'With Product Upload', price: 400, platformFee: 100, expertPayout: 350 },
    design: { title: 'Theme Customization', price: 450, platformFee: 100, expertPayout: 450 },
  };

  const specialtyLabels: Record<string, string> = {
    setup: 'Store Setup',
    products: 'Product Management',
    design: 'Design & Branding',
    marketing: 'Marketing',
  };

  useEffect(() => {
    fetchActiveExperts().then((data) => {
      setExperts(data || []);
      setLoadingExperts(false);
    });
  }, []);

  const handleRequest = () => {
    if (!phone) return toast.error("Please enter your WhatsApp number so the expert can contact you.");
    if (!selectedExpert) return toast.error("Please select an expert to work with.");
    if (!selectedService) return toast.error("Please select a service package.");
    
    startTransition(async () => {
      const pkg = PACKAGES[selectedService as keyof typeof PACKAGES];
      
      const formData = new FormData();
      formData.append('storeId', storeId!);
      formData.append('serviceType', selectedService);
      formData.append('contactPhone', phone);
      formData.append('selectedExpertId', selectedExpert);
      formData.append('totalAmount', pkg.price.toString());
      formData.append('platformFee', pkg.platformFee.toString());

      const res = await submitExpertRequest(formData);
      
      if (res?.success) {
        toast.success("Request Sent! Proceed to make payment to start your project.");
        setPhone('');
        setSelectedExpert(null);
        setSelectedService(null);
      } else {
        toast.error(res?.error || "Failed to send request.");
      }
    });
  };

  if (loading || loadingExperts) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="text-center mb-12 py-10">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100">
           <Sparkles size={14} /> Nimde Certified Experts
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
           We Build, You Sell.
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
           Hire a trained Nimde Expert to handle the technical setup so you can focus on making sales.
        </p>
      </div>

      {/* PHONE INPUT */}
      <div className="max-w-md mx-auto mb-12 bg-white p-2 rounded-2xl shadow-xl shadow-indigo-100 border border-indigo-50 flex items-center">
         <div className="pl-4 pr-2 text-slate-400 font-bold text-sm select-none">🇬🇭 +233</div>
         <input 
            type="tel" 
            placeholder="24 123 4567" 
            className="flex-1 bg-transparent outline-none text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-300"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            maxLength={10}
         />
      </div>

      {/* SELECT SERVICE PACKAGE */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-4">1. Choose Your Service</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(PACKAGES).map(([key, pkg]) => (
            <button
              key={key}
              onClick={() => setSelectedService(key)}
              className={`p-6 border-2 rounded-xl text-left transition-all ${
                selectedService === key
                  ? 'border-orange-500 bg-orange-50 shadow-lg'
                  : 'border-slate-200 hover:border-orange-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900">{pkg.title}</h3>
                {selectedService === key && <CheckCircle className="text-orange-500" size={20} />}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-orange-600">GHS {pkg.price}</p>
                <p className="text-xs text-slate-500">Platform fee: GHS {pkg.platformFee}</p>
                <p className="text-xs text-slate-500">Expert gets: GHS {pkg.expertPayout}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SELECT EXPERT */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-4">2. Select Your Expert</h2>
        
        {experts.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-xl text-center text-slate-500">
            No experts available at the moment. Check back soon!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {experts
              .filter((expert) => 
                !selectedService || expert.specialties.includes(selectedService)
              )
              .map((expert) => (
                <button
                  key={expert.id}
                  onClick={() => setSelectedExpert(expert.id)}
                  className={`p-6 border-2 rounded-xl text-left transition-all ${
                    selectedExpert === expert.id
                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                      : 'border-slate-200 hover:border-orange-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* AVATAR */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {expert.name.charAt(0).toUpperCase()}
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-900">{expert.name}</h3>
                        {selectedExpert === expert.id && (
                          <CheckCircle className="text-orange-500 flex-shrink-0" size={20} />
                        )}
                      </div>

                      {expert.bio && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{expert.bio}</p>
                      )}

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm font-semibold text-slate-700">
                            {expert.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Briefcase size={14} />
                          <span className="text-sm font-semibold">
                            {expert.jobs_completed} jobs
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {expert.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                          >
                            {specialtyLabels[specialty] || specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <div className="sticky bottom-6 max-w-md mx-auto">
        <button
          onClick={handleRequest}
          disabled={isPending || !phone || !selectedExpert || !selectedService}
          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Sending Request...
            </>
          ) : (
            <>
              Request Expert
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>

      {/* TRUST SIGNALS */}
      <div className="mt-16 grid md:grid-cols-3 gap-6 text-center">
         <div className="space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-green-50 text-green-600 mx-auto">
               <ShieldCheck size={24} />
            </div>
            <h4 className="font-bold text-slate-900">Verified Experts</h4>
            <p className="text-sm text-slate-500 leading-relaxed">All experts are personally trained and vetted by Nimde</p>
         </div>
         <div className="space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-orange-600 mx-auto">
               <Clock size={24} />
            </div>
            <h4 className="font-bold text-slate-900">Fast Turnaround</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Most projects completed within 2-3 business days</p>
         </div>
         <div className="space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-purple-50 text-purple-600 mx-auto">
               <CheckCircle2 size={24} />
            </div>
            <h4 className="font-bold text-slate-900">Quality Guaranteed</h4>
            <p className="text-sm text-slate-500 leading-relaxed">100% satisfaction or your money back</p>
         </div>
      </div>
    </div>
  );
}
