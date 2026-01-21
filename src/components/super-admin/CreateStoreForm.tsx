'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function CreateStoreForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Stop default reload
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      // ✅ Call the API Route instead of Server Action
      const req = await fetch('/api/super/create-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const res = await req.json();

      if (!req.ok) {
        toast.error(res.error || 'Failed to create store');
      } else {
        toast.success(res.message);
        router.refresh(); // Update the list
        // Optional: Reset form
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input name="storeName" placeholder="Store Name (e.g. Shoe Plug)" className="p-2 border rounded" required />
      <input name="storeSlug" placeholder="Slug (e.g. shoeplug)" className="p-2 border rounded" required />
      <input name="email" type="email" placeholder="Owner Email" className="p-2 border rounded" required />
      <input name="password" type="text" placeholder="Owner Password" className="p-2 border rounded" required />
      
      <select name="plan" className="p-2 border rounded">
        <option value="starter">Starter (₵175)</option>
        <option value="growth">Growth (₵450)</option>
      </select>

      <button disabled={loading} className="bg-slate-900 text-white p-2 rounded col-span-2 hover:bg-slate-800 disabled:opacity-50">
        {loading ? 'Creating Ecosystem...' : '✨ Create Store'}
      </button>
    </form>
  );
}