"use client";

import React from 'react';
import { GridEditor } from '@/components/admin/GridEditor';

export default function AdminGridPage() {
  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Homepage Grid</h1>
        <p className="text-slate-500">
          Customize the 4 main tiles on your homepage (Features, Delivery, Warranty, Testimonials).
        </p>
      </div>
      
      {/* Render the Editor Component we built earlier */}
      <GridEditor />
    </div>
  );
}