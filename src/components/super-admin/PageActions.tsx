'use client';

import { useState } from 'react';
import { CreateStoreModal } from '@/components/super-admin/CreateStoreModal';
import { PlusCircle } from 'lucide-react';

export function PageActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 active:translate-y-0"
      >
        <PlusCircle size={20} /> Deploy New Store
      </button>

      <CreateStoreModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}