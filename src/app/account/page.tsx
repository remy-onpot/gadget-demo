"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Lock, Package, Save, Loader2, LogOut, Phone, MapPin, Mail, Calendar, ChevronRight, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'orders'>('profile');
  
  // Data States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  // Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI States
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    // 1. Get Auth User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);

    // 2. Get Public Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      setProfile(profile);
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.shipping_address || '');
    }

    // 3. Get Orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (orders) setOrders(orders);
    
    setLoading(false);
  };

  const updateProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          shipping_address: address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password updated! Please login again next time.' });
      setNewPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-orange-500" size={32}/></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* 1. HERO BANNER */}
      <div className="bg-slate-900 h-48 sm:h-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-90"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        {/* Decor */}
        <div className="absolute -right-20 -top-40 w-96 h-96 bg-orange-500 rounded-full blur-[100px] opacity-20"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-24 z-10">
        
        {/* 2. PROFILE HEADER CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 border border-slate-100">
           
           {/* Avatar */}
           <div className="relative shrink-0">
             <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-900 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-black text-white ring-4 ring-white shadow-lg">
                {fullName ? fullName.charAt(0) : user.email.charAt(0).toUpperCase()}
             </div>
             <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
           </div>

           {/* User Info */}
           <div className="flex-1 text-center sm:text-left space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{fullName || 'Valued Customer'}</h1>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-slate-500 text-sm font-medium">
                  <span className="flex items-center gap-1.5"><Mail size={14}/> {user.email}</span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14}/> Member since {new Date(user.created_at).getFullYear()}</span>
              </div>
           </div>

           {/* Logout Button */}
           <button onClick={handleLogout} className="shrink-0 flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-sm px-4 py-2 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut size={16} /> <span className="hidden sm:inline">Sign Out</span>
           </button>
        </div>

        {/* 3. MAIN GRID */}
        <div className="grid md:grid-cols-12 gap-8">
          
          {/* SIDEBAR NAV */}
          <div className="md:col-span-3 lg:col-span-3">
             <div className="sticky top-24 space-y-2">
                <NavButton 
                  active={activeTab === 'profile'} 
                  onClick={() => setActiveTab('profile')} 
                  icon={<User size={18} />} 
                  label="My Profile" 
                  desc="Manage your info"
                />
                <NavButton 
                  active={activeTab === 'orders'} 
                  onClick={() => setActiveTab('orders')} 
                  icon={<Package size={18} />} 
                  label="Order History" 
                  desc="Track purchases"
                />
                <NavButton 
                  active={activeTab === 'security'} 
                  onClick={() => setActiveTab('security')} 
                  icon={<ShieldCheck size={18} />} 
                  label="Security" 
                  desc="Password & Login"
                />
             </div>
          </div>

          {/* CONTENT AREA */}
          <div className="md:col-span-9 lg:col-span-9">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm min-h-[500px]">
              
              {/* FEEDBACK MESSAGES */}
              {message && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {message.type === 'success' ? <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> : <div className="w-2 h-2 rounded-full bg-red-500"/>}
                  {message.text}
                </div>
              )}

              {/* TAB: PROFILE */}
              {activeTab === 'profile' && (
                <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8 border-b border-slate-100 pb-4">
                     <h2 className="text-xl font-black text-slate-900">Personal Details</h2>
                     <p className="text-slate-500 text-sm mt-1">Update your shipping information for faster checkout.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <InputGroup label="Full Name" icon={<User size={18} />}>
                           <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-10 p-3 bg-slate-50 border-transparent focus:bg-white border-2 focus:border-orange-500 rounded-xl font-bold text-slate-900 outline-none transition-all" />
                        </InputGroup>

                        <InputGroup label="Phone Number" icon={<Phone size={18} />}>
                           <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+233..." className="w-full pl-10 p-3 bg-slate-50 border-transparent focus:bg-white border-2 focus:border-orange-500 rounded-xl font-bold text-slate-900 outline-none transition-all" />
                        </InputGroup>
                    </div>

                    <InputGroup label="Shipping Address" icon={<MapPin size={18} />}>
                       <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="Apartment, Street, City..." className="w-full pl-10 p-3 bg-slate-50 border-transparent focus:bg-white border-2 focus:border-orange-500 rounded-xl font-medium text-slate-700 outline-none transition-all resize-none" />
                    </InputGroup>
                    
                    <div className="pt-2">
                      <button onClick={updateProfile} disabled={saving} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-500 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-slate-900/10">
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
                     <p className="text-slate-500 text-sm mt-1">Manage your account credentials.</p>
                  </div>
                  
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                         <Mail size={18} />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                         <p className="font-bold text-slate-900">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">VERIFIED</span>
                  </div>

                  <div className="space-y-6">
                    <InputGroup label="New Password" icon={<Lock size={18} />}>
                       <input 
                         type="password" 
                         value={newPassword} 
                         onChange={e => setNewPassword(e.target.value)} 
                         placeholder="••••••••" 
                         className="w-full pl-10 p-3 bg-slate-50 border-transparent focus:bg-white border-2 focus:border-orange-500 rounded-xl font-bold text-slate-900 outline-none transition-all" 
                       />
                    </InputGroup>
                    <p className="text-xs text-slate-400 ml-1">Must contain lowercase, uppercase, digits,symbols and be at least 8 characters long.</p>

                    <div className="pt-2">
                      <button onClick={updatePassword} disabled={saving || !newPassword} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-500 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-slate-900/10">
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
                        <p className="text-slate-400 text-sm mb-6">Looks like you haven't made any purchases.</p>
                        <button onClick={() => router.push('/')} className="text-orange-600 font-bold text-sm hover:underline">Start Shopping →</button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="border border-slate-100 rounded-2xl p-5 hover:border-orange-200 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between group bg-white">
                             <div className="flex items-start gap-4 mb-4 sm:mb-0">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                   order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-50 text-orange-500'
                                }`}>
                                   <Package size={20} />
                                </div>
                                <div>
                                   <p className="font-bold text-slate-900 flex items-center gap-2">
                                      Order #{order.id.slice(0,8)}
                                   </p>
                                   <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                                      <Calendar size={10} /> {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
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
                                   <p className="font-black text-slate-900 mt-1">₵{order.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-orange-500 transition-colors" size={20} />
                             </div>
                          </div>
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

function NavButton({ active, onClick, icon, label, desc }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-center gap-4 group ${
        active 
          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02]' 
          : 'bg-white text-slate-500 hover:bg-white hover:text-orange-600 hover:shadow-md'
      }`}
    >
      <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500'}`}>
         {icon}
      </div>
      <div>
         <span className={`block font-bold text-sm ${active ? 'text-white' : 'text-slate-700'}`}>{label}</span>
         <span className={`block text-xs ${active ? 'text-slate-400' : 'text-slate-400'}`}>{desc}</span>
      </div>
    </button>
  );
}

function InputGroup({ label, icon, children }: any) {
   return (
      <div className="space-y-1.5">
         <label className="text-xs font-bold uppercase text-slate-400 ml-1">{label}</label>
         <div className="relative group">
            <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors">
               {icon}
            </div>
            {children}
         </div>
      </div>
   );
}