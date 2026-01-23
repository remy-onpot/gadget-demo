import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  LogOut, 
  Users, 
  Server
} from 'lucide-react';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Basic Auth Check
  if (!user) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. GOD MODE HEADER */}
      <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-rose-500 font-black tracking-tight text-lg">
               <ShieldAlert size={24} />
               <span>GOD MODE</span>
            </div>
            
            <div className="h-6 w-px bg-slate-700 mx-2 hidden md:block" />
            
            <nav className="hidden md:flex gap-1">
               <Link href="/admin/super" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white text-sm font-medium transition-all">
                  <Server size={16} /> Overview
               </Link>
               {/* Future: Add 'Users', 'System Logs', etc. */}
            </nav>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end leading-tight">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operator</span>
                <span className="text-sm font-medium">{user.email}</span>
             </div>
             
             <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
                SA
             </div>

             <form action="/auth/signout" method="post">
               <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-rose-400 transition-colors" title="Sign Out">
                 <LogOut size={18} />
               </button>
             </form>
          </div>

        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

    </div>
  );
}