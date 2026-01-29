'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createStoreAndUser, checkSlugAvailability } from '@/actions/super-admin';
import { 
  Loader2, Zap, UserCheck, MapPin, Fingerprint, Store, 
  ArrowRight, ArrowLeft, X, CheckCircle, AlertCircle, Lock 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function CreateStoreModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const router = useRouter();

  // Unified Form State
  const [formData, setFormData] = useState({
    legalName: '', phone: '', email: '',             // Phase 1
    governmentId: '', digitalAddress: '', physicalAddress: '', // Phase 2
    storeName: '', storeSlug: '', plan: 'starter',   // Phase 3
    password: ''                                     // Phase 4
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset slug status if user types new slug
    if (e.target.name === 'storeSlug') setSlugStatus('idle');
  };

  const validateStep = async () => {
    // Phase 1 Validation
    if (step === 1) {
      if (!formData.legalName || !formData.phone || !formData.email) return toast.error("Please fill all contact details");
      setStep(2);
    }
    // Phase 2 Validation
    else if (step === 2) {
      if (!formData.governmentId || !formData.digitalAddress) return toast.error("KYC details are required");
      setStep(3);
    }
    // Phase 3 Validation + Slug Check
    else if (step === 3) {
      if (!formData.storeName || !formData.storeSlug) return toast.error("Store details missing");
      
      setSlugStatus('checking');
      const { available } = await checkSlugAvailability(formData.storeSlug);
      
      if (!available) {
        setSlugStatus('taken');
        return toast.error("URL Slug is already taken. Try another.");
      }
      
      setSlugStatus('available');
      setStep(4);
    }
  };

  const handleFinalSubmit = async () => {
    if (!formData.password) return toast.error("Secure password required");
    
    setLoading(true);
    
    // Convert state to FormData for the server action
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => payload.append(key, value));

    const res = await createStoreAndUser(payload);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
      router.refresh();
      onClose(); // Close modal on success
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
           <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                 <Zap className="text-indigo-600 fill-current" size={20} /> Deploy Ecosystem
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                 Phase {step} of 4: {
                   step === 1 ? 'Merchant Identity' : 
                   step === 2 ? 'KYC & Location' : 
                   step === 3 ? 'Store Configuration' : 'Security & Launch'
                 }
              </p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} className="text-slate-500" />
           </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-1 bg-slate-100">
           <div 
             className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
             style={{ width: `${(step / 4) * 100}%` }} 
           />
        </div>

        {/* BODY (Scrollable) */}
        <div className="p-8 overflow-y-auto flex-1">
           
           {/* PHASE 1: IDENTITY */}
           {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                 <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                       <UserCheck size={20} />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 text-sm">Legal Contact</h3>
                       <p className="text-xs text-slate-500">Who is legally responsible for this store?</p>
                    </div>
                 </div>
                 
                 <div className="grid md:grid-cols-2 gap-5">
                    <Input label="Legal Full Name" name="legalName" val={formData.legalName} onChange={handleChange} placeholder="e.g. Evans Kojo" autoFocus />
                    <Input label="Phone Number" name="phone" val={formData.phone} onChange={handleChange} placeholder="024 000 0000" />
                 </div>
                 <Input label="Personal Email" name="email" type="email" val={formData.email} onChange={handleChange} placeholder="owner@gmail.com" />
              </div>
           )}

           {/* PHASE 2: KYC */}
           {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                 <div className="flex items-center gap-4 mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                       <Fingerprint size={20} />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 text-sm">Government KYC</h3>
                       <p className="text-xs text-slate-500">Required for fraud prevention and compliance.</p>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-5">
                    <Input label="Ghana Card ID" name="governmentId" val={formData.governmentId} onChange={handleChange} placeholder="GHA-000000000-0" icon={<Fingerprint size={16}/>} autoFocus />
                    <Input label="Digital Address (GPS)" name="digitalAddress" val={formData.digitalAddress} onChange={handleChange} placeholder="GA-123-4567" icon={<MapPin size={16}/>} />
                 </div>
                 <Input label="Physical Residence" name="physicalAddress" val={formData.physicalAddress} onChange={handleChange} placeholder="Hse No. 12, Block B..." />
              </div>
           )}

           {/* PHASE 3: STORE */}
           {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                 <div className="flex items-center gap-4 mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                       <Store size={20} />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 text-sm">Business Profile</h3>
                       <p className="text-xs text-slate-500">Define the public facing store details.</p>
                    </div>
                 </div>

                 <Input label="Business Name" name="storeName" val={formData.storeName} onChange={handleChange} placeholder="e.g. Shoe Plug GH" autoFocus />
                 
                 <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                          URL Slug
                          {slugStatus === 'checking' && <span className="text-blue-500 flex items-center gap-1"><Loader2 className="animate-spin" size={10} /> Checking...</span>}
                          {slugStatus === 'available' && <span className="text-green-500 flex items-center gap-1"><CheckCircle size={10} /> Available</span>}
                          {slugStatus === 'taken' && <span className="text-red-500 flex items-center gap-1"><AlertCircle size={10} /> Taken</span>}
                       </label>
                       <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-bold">
                            nimdeshop.com/
                          </span>
                          <input 
                            name="storeSlug" 
                            value={formData.storeSlug} 
                            onChange={handleChange}
                            placeholder="shoeplug" 
                            className={cn(
                               "w-full px-4 py-3 bg-white border rounded-r-lg text-sm font-bold text-slate-900 outline-none transition-all",
                               slugStatus === 'taken' ? "border-red-300 focus:border-red-500 bg-red-50" : 
                               slugStatus === 'available' ? "border-green-300 focus:border-green-500 bg-green-50" :
                               "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            )} 
                          />
                       </div>
                    </div>

                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase">Billing Plan</label>
                       <select name="plan" value={formData.plan} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500">
                          <option value="starter">Starter (₵250 / mo)</option>
                          <option value="growth">Growth (₵450 / mo)</option>
                          <option value="enterprise">Enterprise (Custom)</option>
                       </select>
                    </div>
                 </div>
              </div>
           )}

           {/* PHASE 4: SECURITY */}
           {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 text-center py-4">
                 <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-100">
                    <Lock className="text-green-600" size={32} />
                 </div>
                 
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Final Security Check</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                       Set a temporary password for the merchant. They will be prompted to change this upon first login.
                    </p>
                 </div>

                 <div className="max-w-sm mx-auto text-left">
                    <Input label="Initial Password" name="password" type="password" val={formData.password} onChange={handleChange} placeholder="Generate secure password..." autoFocus />
                 </div>

                 <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 max-w-sm mx-auto mt-4">
                    <p>By clicking deploy, you confirm that <strong>{formData.legalName}</strong> has passed preliminary manual verification.</p>
                 </div>
              </div>
           )}

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
           {step > 1 ? (
             <button onClick={() => setStep(step - 1)} className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-2 px-4 py-2">
                <ArrowLeft size={16} /> Back
             </button>
           ) : <div />}

           {step < 4 ? (
             <button onClick={validateStep} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95">
                Next Phase <ArrowRight size={18} />
             </button>
           ) : (
             <button 
               onClick={handleFinalSubmit} 
               disabled={loading}
               className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {loading ? <Loader2 className="animate-spin" /> : <Zap fill="currentColor" size={18} />} 
                Deploy Ecosystem
             </button>
           )}
        </div>

      </div>
    </div>
  );
}

// Helper Input Component
function Input({ label, name, type = "text", val, onChange, placeholder, icon, autoFocus }: any) {
  return (
    <div className="space-y-1">
       <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
       <div className="relative">
          {icon && <div className="absolute left-3 top-3.5 text-slate-400">{icon}</div>}
          <input 
            name={name} 
            type={type} 
            value={val} 
            onChange={onChange}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              "w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all",
              icon && "pl-10"
            )} 
          />
       </div>
    </div>
  )
}