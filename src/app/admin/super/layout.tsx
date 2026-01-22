import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Super Admin Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-orange-500">NimdeShop God Mode</span>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
              {user.email}
            </span>
          </div>
          <nav className="flex gap-4 text-sm">
             <Link href="/admin/inventory" className="hover:text-white text-slate-400">
               My Store Dashboard
             </Link>
             <form action="/auth/signout" method="post">
               <button className="hover:text-red-400">Sign Out</button>
             </form>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}