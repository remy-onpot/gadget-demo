"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
// Make sure you update your actions.ts to include the 'submitApplicationOnly' function we discussed
import { submitApplicationOnly, checkSlug } from '../actions';
import { 
  User, MapPin, Store, ArrowRight, ArrowLeft, 
  CheckCircle, Loader2, ShieldCheck, UploadCloud, AlertCircle, Briefcase, MessageCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ApplicationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Unified Form State (Password removed - Admin generates it)
  const [formData, setFormData] = useState({
    // Step 1: Contact
    legalName: '', phone: '', email: '',
    // Step 2: KYC
    governmentId: '', digitalAddress: '', physicalAddress: '', idFile: null as File | null,
    // Step 3: Store
    storeName: '', storeSlug: '', planId: 'starter'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'storeSlug') setSlugStatus('idle');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, idFile: e.target.files[0] });
    }
  };

  const validateStep = async () => {
    // Phase 1: Identity
    if (step === 1) {
      if (!formData.legalName || !formData.email || !formData.phone) return toast.error("Please fill all contact details");
      if (!formData.email.includes('@')) return toast.error("Invalid email address");
      setStep(2);
    }
    // Phase 2: KYC
    else if (step === 2) {
      if (!formData.governmentId || !formData.digitalAddress) return toast.error("KYC Details are required");
      if (!formData.idFile) return toast.error("Please upload your ID document");
      setStep(3);
    }
    // Phase 3: Store & Slug
    else if (step === 3) {
        if (!formData.storeName || !formData.storeSlug) return toast.error("Store details missing");
        
        setSlugStatus('checking');
        const { available } = await checkSlug(formData.storeSlug);
        
        if (!available) {
          setSlugStatus('taken');
          return toast.error("URL Slug is already taken");
        }
        
        setSlugStatus('available');
        setStep(4);
    }
  };

  const handleSubmit = async () => {
    startTransition(async () => {
        const payload = new FormData();
        
        // Append all text fields
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'idFile') payload.append(key, value as string);
        });
        
        // Append file
        if (formData.idFile) payload.append('idDocument', formData.idFile);

        const res = await submitApplicationOnly(payload);
        
        if (res?.error) {
            toast.error(res.error);
        } else if (res?.applicationId) {
            toast.success("Application Received!");
            // Redirect to payment page with application ID
            router.push(`/onboarding/payment?id=${res.applicationId}`);
        } else {
            toast.error("Application submitted but ID not returned");
        }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100">
        
        {/* SIDEBAR (Progress & Branding) */}
        <div className="bg-[#0f172a] text-white p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
           {/* Background Pattern */}
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-rose-500 rounded-full blur-3xl"></div>
           </div>

           <div className="relative z-10">
              <div className="flex items-center gap-2 text-rose-500 font-black tracking-tight text-xl mb-10">
                 <ShieldCheck size={28} />
                 <span>NIMDE VERIFIED</span>
              </div>
              <div className="space-y-8">
                 <StepItem num={1} title="Identity & Contact" active={step === 1} done={step > 1} />
                 <StepItem num={2} title="Compliance & KYC" active={step === 2} done={step > 2} />
                 <StepItem num={3} title="Store Configuration" active={step === 3} done={step > 3} />
                 <StepItem num={4} title="Review & Submit" active={step === 4} done={step > 4} />
              </div>
           </div>
           
           <div className="relative z-10 mt-12 pt-8 border-t border-slate-800">
              <div className="flex items-center gap-3 text-slate-300">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Briefcase size={18} />
                 </div>
                 <div className="text-xs leading-relaxed">
                    <strong>Merchant Application</strong><br/>
                    Manual Review Required.<br/>
                    <span className="opacity-50">Ref: REG-{new Date().getFullYear()}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* FORM AREA */}
        <div className="flex-1 p-8 md:p-12 flex flex-col bg-white">
            
            <div className="flex-1 max-w-lg mx-auto w-full">
                
                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Who are you?</h2>
                            <p className="text-slate-500">We need your legal contact details for the contract.</p>
                        </div>
                        
                        <Input label="Legal Full Name" name="legalName" val={formData.legalName} onChange={handleChange} placeholder="Kwame Mensah" />
                        <Input label="Email Address" name="email" type="email" val={formData.email} onChange={handleChange} placeholder="store@gmail.com" />
                        
                        <div className="relative">
                            <Input label="WhatsApp Number" name="phone" val={formData.phone} onChange={handleChange} placeholder="0244 000 000" />
                            <MessageCircle size={16} className="absolute right-4 top-9 text-green-500" />
                        </div>
                        
                        <div className="bg-green-50 text-green-800 p-4 rounded-xl text-xs flex gap-3 border border-green-100 mt-4">
                           <MessageCircle className="shrink-0" size={16} />
                           <p><strong>Important:</strong> If approved, your login credentials will be sent to this WhatsApp number.</p>
                        </div>
                    </div>
                )}

                {/* STEP 2: KYC */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Verification</h2>
                            <p className="text-slate-500">To prevent fraud, we require government ID.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <Input label="Ghana Card / ID" name="governmentId" val={formData.governmentId} onChange={handleChange} placeholder="GHA-000000000-0" />
                            <Input label="Digital Address (GPS)" name="digitalAddress" val={formData.digitalAddress} onChange={handleChange} placeholder="GA-000-0000" />
                        </div>
                        <Input label="Physical Residence" name="physicalAddress" val={formData.physicalAddress} onChange={handleChange} placeholder="House No, Street Name, City" />
                        
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer relative group">
                            <input type="file" onChange={handleFileChange} accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <UploadCloud className="text-indigo-600" size={24} />
                            </div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                                {formData.idFile ? formData.idFile.name : "Click to Upload ID Document"}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">PDF, JPG or PNG (Max 5MB)</div>
                        </div>
                    </div>
                )}

                {/* STEP 3: STORE */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Your Business</h2>
                            <p className="text-slate-500">How do you want to appear to customers?</p>
                        </div>

                        <Input label="Store Name" name="storeName" val={formData.storeName} onChange={handleChange} placeholder="My Awesome Shop" />
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex justify-between items-center">
                                Store Link
                                {slugStatus === 'checking' && <span className="text-blue-500 text-xs flex items-center gap-1"><Loader2 className="animate-spin" size={12}/> Checking...</span>}
                                {slugStatus === 'available' && <span className="text-green-500 text-xs flex items-center gap-1"><CheckCircle size={12}/> Available</span>}
                                {slugStatus === 'taken' && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> Taken</span>}
                            </label>
                            <div className={`flex items-center border rounded-xl overflow-hidden transition-colors ${slugStatus === 'taken' ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'}`}>
                                <input 
                                    name="storeSlug" value={formData.storeSlug} onChange={handleChange}
                                    placeholder="your-brand"
                                    className="flex-1 px-4 py-3 text-sm font-bold bg-transparent outline-none text-slate-900 placeholder:font-normal"
                                />
                                <span className="bg-slate-50 border-l border-slate-200 px-4 py-3 text-slate-500 text-sm font-bold select-none">.nimdeshop.com</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">Billing Plan</label>
                             <div className="relative">
                                <select name="planId" value={formData.planId} onChange={handleChange} className="w-full appearance-none border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold bg-white text-slate-900 focus:outline-none focus:border-indigo-500">
                                    <option value="free">Free Playground (Private Mode)</option>
                                    <option value="starter">Starter (₵250 / mo)</option>
                                    <option value="growth">Growth (₵450 / mo)</option>
                                    <option value="pro">Pro Enterprise (₵1200 / mo)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ArrowLeft className="-rotate-90" size={14}/>
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: REVIEW */}
                {step === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 text-center pt-8">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <ShieldCheck className="text-indigo-600" size={48} />
                        </div>
                        
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Ready to Submit?</h2>
                            <p className="text-slate-500 max-w-md mx-auto">
                                By clicking submit, you confirm that all provided information is accurate. 
                                <br/>Our compliance team will review your application within 4 hours.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl text-left text-sm space-y-3 border border-slate-200 max-w-sm mx-auto shadow-sm">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                <span className="text-slate-500">Applicant</span> 
                                <strong className="text-slate-900">{formData.legalName}</strong>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                <span className="text-slate-500">Email</span> 
                                <strong className="text-slate-900">{formData.email}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Store</span> 
                                <strong className="text-slate-900">{formData.storeName}</strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CONTROLS */}
            <div className="pt-8 mt-4 border-t border-slate-100 flex justify-between items-center">
                {step > 1 ? (
                    <button onClick={() => setStep(step - 1)} className="text-slate-400 hover:text-slate-700 font-bold text-sm flex items-center gap-2 transition-colors px-2 py-2">
                        <ArrowLeft size={16} /> Back
                    </button>
                ) : <div></div>}

                {step < 4 ? (
                    <button onClick={validateStep} className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95">
                        Continue <ArrowRight size={16} />
                    </button>
                ) : (
                    <button onClick={handleSubmit} disabled={isPending} className="bg-indigo-600 text-white px-10 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 active:scale-95">
                        {isPending ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18} />}
                        Submit Application
                    </button>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StepItem({ num, title, active, done }: any) {
    return (
        <div className={`flex items-center gap-4 transition-all duration-300 ${active ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${active || done ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'border-slate-600 text-slate-400 bg-transparent'}`}>
                {done ? <CheckCircle size={14}/> : num}
            </div>
            <span className="font-bold text-sm tracking-wide">{title}</span>
        </div>
    )
}

function Input({ label, name, type="text", val, onChange, placeholder }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>
            <input 
                name={name} type={type} value={val} onChange={onChange} placeholder={placeholder}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
        </div>
    )
}