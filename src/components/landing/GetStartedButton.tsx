"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface GetStartedButtonProps {
  className?: string;
  text?: string;
  variant?: 'primary' | 'secondary' | 'nav';
}

export const GetStartedButton = ({ className, text = "Start Selling", variant = 'primary' }: GetStartedButtonProps) => {
  // Base Button Styles
  const baseStyles = "transition-all font-bold flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 px-8 py-4 rounded-2xl text-lg",
    secondary: "bg-[#25D366] text-[#01030d] hover:bg-[#20bd5a] shadow-lg shadow-green-900/20 px-8 py-4 rounded-xl text-lg font-black",
    nav: "bg-white text-[#020617] hover:bg-slate-200 px-5 py-2.5 rounded-full text-sm"
  };

  return (
    <Link 
      href="/onboarding/apply"
      className={`${baseStyles} ${variants[variant]} ${className || ''}`}
    >
      {text} {variant !== 'nav' && <ArrowRight size={20} />}
    </Link>
  );
};