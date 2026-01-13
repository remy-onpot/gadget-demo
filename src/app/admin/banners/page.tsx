"use client";

import React from 'react';
import { MarketingManager } from '@/components/admin/MarketingManager';
import { Megaphone, LayoutTemplate } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Megaphone className="text-orange-500" size={32} /> Marketing Assets
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Manage your Homepage Hero, Side Banners, and Branch Photos.
          </p>
        </div>
      </div>

      {/* The New Manager Component */}
      <MarketingManager />
    </div>
  );
}