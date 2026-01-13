import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DesktopSuggestion } from '@/components/shop/DesktopSuggestion';
// 1. Load Inter (Standard for modern e-commerce)
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Prevents invisible text during load
});

export const metadata: Metadata = {
  title: "Payless4Tech | Premium Gadgets in Ghana",
  description: "Your one-stop shop for UK Used laptops, gaming consoles, and phones. Located at Accra Mall.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-orange-900">
        {children}
        <DesktopSuggestion /> {/* <-- Drop it here */}
      </body>
    </html>
  );
}
