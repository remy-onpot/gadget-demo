"use client";

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { updateCustomerProfile, updatePassword } from '@/app/sites/[site]/account/actions'; 
import { 
  User as UserIcon, Lock, Package, Save, Loader2, LogOut, 
  Phone, MapPin, Mail, Calendar, ChevronRight, ShieldCheck, 
  CreditCard, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];

interface ProfileDashboardProps {
  initialUser: User;
  storeId: string;
  initialProfile: ProfileRow | null;
  initialOrders: OrderRow[];
}

// Unified Input Styles
const INPUT_BASE = "w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 placeholder:text-slate-400";

export default function ProfileDashboard({ initialUser, storeId, initialProfile, initialOrders }: ProfileDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'orders'>('profile');
  
  // Data States (initialized from server props)
  const [profile] = useState<ProfileRow | null>(initialProfile);
  const [orders] = useState<OrderRow[]>(initialOrders);

  // Form States (initialized from profile data)
  const [fullName, setFullName] = useState(initialProfile?.full_name || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');
  const [address, setAddress] = useState(initialProfile?.shipping_address || '');
  const [newPassword, setNewPassword] = useState('');
  
  // UI States
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check URL hash for tab deep-linking (e.g. /account#orders)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (['profile', 'orders', 'security'].includes(hash)) {
        setActiveTab(hash as any);
      }
    }
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      await updateCustomerProfile({ fullName, phone, address });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setSaving(true);
    try {
      await updatePassword(newPassword);
      toast.success("Password updated! Please login again next time.");
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    // Client-side logout redirect - actual signOut happens on server
    router.push('/api/auth/signout');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* 1. HERO BANNER */}
      <div className="h-48 sm:h-64 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-90"></div>
        <div className="absolute -right-20 -top-40 w-96 h-96 rounded-full blur-[100px] opacity-20 bg-[var(--primary)] animate-pulse"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-24 z-10">
        
        {/* 2. PROFILE HEADER CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 border border-slate-100">
           {/* Avatar */}
           <div className="relative shrink-0">
             <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-900 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-black text-white ring-4 ring-white shadow-lg">
                {fullName ? fullName.charAt(0) : initialUser.email?.charAt(0).toUpperCase()}
             </div>
             <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
           </div>

           {/* User Info */}
           <div className="flex-1 text-center sm:text-left space-y-2 w-full">
             <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
               {fullName || 'Valued Customer'}
             </h1>
             <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-slate-500 text-sm font-medium">
                 <span className="flex items-center gap-1.5 truncate"><Mail size={14}/> {initialUser.email}</span>
                 <span className="hidden sm:inline text-slate-300">•</span>
                 <span className="flex items-center gap-1.5"><Calendar size={14}/> Member since {new Date(initialUser.created_at).getFullYear()}</span>
             </div>
           </div>

           <button onClick={handleLogout} className="shrink-0 flex items-center gap-2 text-slate-400 hover:text-red-600 font-bold text-sm px-4 py-2 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut size={16} /> <span className="hidden sm:inline">Sign Out</span>
           </button>
        </div>

        {/* 3. MAIN GRID */}
        <div className="grid md:grid-cols-12 gap-8">
          
          {/* NAVIGATION (Responsive) */}
          <div className="md:col-span-3 lg:col-span-3">
              {/* Desktop: Sticky Vertical Sidebar */}
              <div className="hidden md:block sticky top-24 space-y-2">
                 <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={18} />} label="My Profile" desc="Manage your info"/>
                 <NavButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Package size={18} />} label="Order History" desc="Track purchases"/>
                 <NavButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<ShieldCheck size={18} />} label="Security" desc="Password & Login"/>
              </div>

              {/* Mobile: Horizontal Scroll Tabs */}
              <div className="md:hidden flex overflow-x-auto pb-4 gap-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                 <MobileTab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={16} />} label="Profile" />
                 <MobileTab active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Package size={16} />} label="Orders" />
                 <MobileTab active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<ShieldCheck size={16} />} label="Security" />
              </div>
          </div>

          {/* CONTENT AREA */}
          <div className="md:col-span-9 lg:col-span-9">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm min-h-[500px]">
              
              {/* TAB: PROFILE */}
              {activeTab === 'profile' && (
                <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8 border-b border-slate-100 pb-4">
                      <h2 className="text-xl font-black text-slate-900">Personal Details</h2>
                      <p className="text-slate-500 text-sm mt-1">Update your shipping information for faster checkout.</p>
                  </div>

                  <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                          <InputGroup id="fullName" label="Full Name" icon={<UserIcon size={18} />}>
                             <input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className={INPUT_BASE} placeholder="John Doe" />
                          </InputGroup>
                          <InputGroup id="phone" label="Phone Number" icon={<Phone size={18} />}>
                             <input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+233..." className={INPUT_BASE} />
                          </InputGroup>
                      </div>

                      <InputGroup id="address" label="Shipping Address" icon={<MapPin size={18} />}>
                          <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="Apartment, Street, City..." className={`${INPUT_BASE} resize-none`} />
                      </InputGroup>
                      
                      <div className="pt-2">
                        <button onClick={handleUpdateProfile} disabled={saving} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--primary)] transition-all hover:shadow-lg disabled:opacity-50">
                          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Update Profile
                        </button>
                      </div>
                  </div>
                </div>
              )}

              {/* TAB: SECURITY */}
{activeTab === 'security' && (
  <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="mb-8 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-slate-900">Login & Security</h2>
    </div>
    
    {/* ... Email Section ... */}

    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <label htmlFor="new-password" className="text-xs font-bold uppercase text-slate-500 ml-1">
           New Password
         </label>
         {/* ADDED LINK HERE */}
         <Link 
           href="/auth/forgot-password" 
           className="text-xs font-bold text-[var(--primary)] hover:underline"
         >
           I don't know my current password
         </Link>
      </div>
      
      <div className="relative group">
         <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors pointer-events-none">
            <Lock size={18} />
         </div>
         <input 
            id="new-password" 
            type="password" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            placeholder="••••••••" 
            className={INPUT_BASE} 
         />
      </div>
      
      <div className="pt-2">
        <button onClick={handleUpdatePassword} disabled={saving || !newPassword} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--primary)] transition-all hover:shadow-lg disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Update Password
        </button>
      </div>
    </div>
  </div>
)}

              {/* TAB: ORDERS */}
              {activeTab === 'orders' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 border-b border-slate-100 pb-4 flex items-center justify-between">
                       <div>
                          <h2 className="text-xl font-black text-slate-900">Order History</h2>
                          <p className="text-slate-500 text-sm mt-1">Track and view your past purchases.</p>
                       </div>
                       <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{orders.length} Orders</span>
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4 shadow-sm">
                           <Package size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No orders yet</h3>
                        <Link href="/" className="text-[var(--primary)] font-bold text-sm hover:underline mt-2 inline-flex items-center gap-1">
                          Start Shopping <ExternalLink size={14}/>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <Link 
                            key={order.id} 
                            href={`/account/orders/${order.id}`}
                            className="border border-slate-100 rounded-2xl p-5 hover:border-[var(--primary)] hover:ring-2 hover:ring-[var(--primary)]/10 hover:shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between group bg-white cursor-pointer"
                          >
                             <div className="flex items-start gap-4 mb-4 sm:mb-0">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                   order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                }`}>
                                   <Package size={20} />
                                </div>
                                <div>
                                   <p className="font-bold text-slate-900 group-hover:text-[var(--primary)] transition-colors">Order #{order.id.slice(0,8)}</p>
                                   <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                                      <Calendar size={10} /> 
                                      {order.created_at 
                                        ? new Date(order.created_at).toLocaleDateString(undefined, {dateStyle: 'medium'}) 
                                        : 'Just now'}
                                   </p>
                                </div>
                             </div>
                             
                             <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-16 sm:pl-0">
                                <div className="text-right">
                                   <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                      order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                   }`}>
                                      {order.status}
                                   </span>
                                   <p className="font-black text-slate-900 mt-1">₵{(order.total_amount || 0).toLocaleString()}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                                  <ChevronRight size={16} />
                                </div>
                             </div>
                          </Link>
                        ))}
                      </div>
                    )}
                 </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- SUB-COMPONENTS ----------------

// Desktop Nav Button
function NavButton({ active, onClick, icon, label, desc }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-center gap-4 group border border-transparent ${
        active 
          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02]' 
          : 'bg-white text-slate-500 hover:bg-white hover:border-slate-200 hover:text-[var(--primary)] hover:shadow-md'
      }`}
    >
      <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]'}`}>
         {icon}
      </div>
      <div>
         <span className={`block font-bold text-sm ${active ? 'text-white' : 'text-slate-700'}`}>{label}</span>
         <span className={`block text-xs ${active ? 'text-slate-400' : 'text-slate-400'}`}>{desc}</span>
      </div>
    </button>
  );
}

// Mobile Scroll Tab
function MobileTab({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
        active 
        ? 'bg-slate-900 text-white shadow-md' 
        : 'bg-white text-slate-600 border border-slate-200'
      }`}
    >
      {icon} {label}
    </button>
  )
}

// Accessible Input Group
function InputGroup({ id, label, icon, children }: { id: string, label: string, icon: ReactNode, children: ReactNode }) {
   return (
      <div className="space-y-1.5">
         <label htmlFor={id} className="text-xs font-bold uppercase text-slate-500 ml-1 cursor-pointer hover:text-[var(--primary)] transition-colors">{label}</label>
         <div className="relative group">
            <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors pointer-events-none">
               {icon}
            </div>
            {children}
         </div>
      </div>
   );
}

// Loading Skeleton
function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid sm:grid-cols-2 gap-6">
         <div className="h-12 bg-slate-100 rounded-xl" />
         <div className="h-12 bg-slate-100 rounded-xl" />
      </div>
      <div className="h-24 bg-slate-100 rounded-xl" />
      <div className="h-12 w-40 bg-slate-100 rounded-xl" />
    </div>
  )
}