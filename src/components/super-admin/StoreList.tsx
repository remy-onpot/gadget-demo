'use client';

import { toggleStoreStatus } from '@/actions/super-admin';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Power, ExternalLink } from 'lucide-react';

export function StoreList({ stores }: { stores: any[] }) {
  const router = useRouter();

  const handleToggle = async (id: string, currentStatus: boolean) => {
    toast.promise(toggleStoreStatus(id, !currentStatus), {
       loading: 'Updating status...',
       success: () => {
          router.refresh();
          return 'Store status updated';
       },
       error: 'Failed to update status'
    });
  };

  if (stores.length === 0) {
     return <div className="p-8 text-center text-slate-400 text-sm">No stores deployed yet.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 font-bold text-slate-500 uppercase text-xs tracking-wider">Store Identity</th>
            <th className="px-6 py-3 font-bold text-slate-500 uppercase text-xs tracking-wider">Plan</th>
            <th className="px-6 py-3 font-bold text-slate-500 uppercase text-xs tracking-wider">Status</th>
            <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase text-xs tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stores.map((store) => (
            <tr key={store.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                 <div className="font-bold text-slate-900">{store.name}</div>
                 <a href={`http://${store.slug}.nimdeshop.com`} target="_blank" className="text-xs text-indigo-500 hover:underline flex items-center gap-1">
                    {store.slug}.nimdeshop.com <ExternalLink size={10} />
                 </a>
              </td>
              <td className="px-6 py-4">
                 <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase border border-slate-200">
                    {store.plan_id}
                 </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                   store.is_active 
                     ? 'bg-green-50 text-green-700 border-green-100' 
                     : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${store.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                  {store.is_active ? 'Online' : 'Suspended'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => handleToggle(store.id, store.is_active)}
                  className="text-slate-400 hover:text-slate-900 p-2 rounded hover:bg-slate-200 transition-all"
                  title={store.is_active ? "Suspend Store" : "Activate Store"}
                >
                  <Power size={18} className={store.is_active ? "text-slate-400 hover:text-red-500" : "text-green-500"} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}