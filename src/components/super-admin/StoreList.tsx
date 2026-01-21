'use client';

import { toggleStoreStatus } from '@/actions/super-admin';
import { toast } from 'sonner';

export function StoreList({ stores }: { stores: any[] }) {
  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await toggleStoreStatus(id, !currentStatus);
    if (res.error) toast.error(res.error);
    else {
        toast.success('Status updated');
        // Ideally router.refresh() here to see update
    }
  };

  return (
    <div className="bg-white border rounded overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-3">Store</th>
            <th className="p-3">Slug</th>
            <th className="p-3">Plan</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {stores.map((store) => (
            <tr key={store.id}>
              <td className="p-3 font-medium">{store.name}</td>
              <td className="p-3 text-slate-500">{store.slug}</td>
              <td className="p-3 uppercase text-xs font-bold">{store.plan_id}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs ${store.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {store.is_active ? 'Active' : 'Suspended'}
                </span>
              </td>
              <td className="p-3">
                <button 
                  onClick={() => handleToggle(store.id, store.is_active)}
                  className="text-blue-600 hover:underline"
                >
                  {store.is_active ? 'Suspend' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}