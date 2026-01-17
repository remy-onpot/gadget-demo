"use client";

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { X, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/lib/database.types';

// 1. DEFINE STRICT TYPES
type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

// Define the exact shape this component expects
// (Parent must pass 'items', usually aliased from 'order_items')
export interface ReceiptOrder extends OrderRow {
  items: OrderItemRow[];
}

interface ReceiptProps {
  order: ReceiptOrder;
  settings: Record<string, string>;
  onClose: () => void;
}

export const ReceiptGenerator = ({ order, settings, onClose }: ReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setGenerating(true);
    
    try {
      // 1. Capture the HTML
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // High resolution for better print quality
        backgroundColor: '#ffffff',
        useCORS: true // Allow loading external logos
      });

      // 2. Convert to Image
      const image = canvas.toDataURL("image/png");
      
      // 3. Trigger Download
      const link = document.createElement('a');
      link.href = image;
      link.download = `Receipt-${order.id.slice(0,6)}.png`;
      link.click();
      
      setGenerating(false);
      toast.success("Receipt downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate receipt.");
      setGenerating(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
       
       <div className="bg-slate-100 p-6 rounded-3xl shadow-2xl max-w-md w-full flex flex-col items-center">
         
         {/* ACTIONS HEADER */}
         <div className="w-full flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-900">Preview Receipt</h3>
             <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-500 hover:text-red-500 transition"><X size={20}/></button>
         </div>

         {/* --- THE RECEIPT (Visuals) --- */}
         <div className="shadow-xl mb-6 overflow-hidden">
             <div 
               ref={receiptRef} 
               className="bg-white p-8 w-[320px] min-h-[400px] text-slate-900 font-mono text-xs leading-relaxed relative"
               style={{ fontFamily: '"Courier New", Courier, monospace' }}
             >
                {/* 1. HEADER */}
                <div className="text-center mb-6 border-b-2 border-dashed border-slate-300 pb-4">
                   {settings['site_logo'] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={settings['site_logo']} alt="Logo" className="h-10 mx-auto mb-2 object-contain grayscale opacity-80" />
                   ) : (
                      <h1 className="text-xl font-black uppercase tracking-widest">{settings['site_name']}</h1>
                   )}
                   <p className="whitespace-pre-line text-[10px] text-slate-500 mt-2">{settings['address_display']}</p>
                   <p className="mt-1">Tel: {settings['support_phone']}</p>
                </div>

                {/* 2. ORDER INFO */}
                <div className="mb-4">
                   <div className="flex justify-between"><span>ORDER #:</span> <span className="font-bold">{order.id.slice(0,8).toUpperCase()}</span></div>
                   <div className="flex justify-between"><span>DATE:</span> <span>{formatDate(order.created_at)}</span></div>
                   <div className="flex justify-between"><span>CUSTOMER:</span> <span className="font-bold uppercase">{order.customer_name}</span></div>
                </div>

                {/* 3. ITEMS */}
                <div className="border-t-2 border-b-2 border-dashed border-slate-300 py-3 mb-4">
                   <div className="flex justify-between font-bold mb-2">
                      <span>ITEM</span>
                      <span>AMT</span>
                   </div>
                   {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between mb-1">
                          <span className="max-w-[70%]">
                             {item.quantity}x {item.product_name} 
                             {item.variant_name && <span className="text-[10px] text-slate-400 block">{item.variant_name}</span>}
                          </span>
                          <span>{(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                   ))}
                </div>

                {/* 4. TOTALS */}
                <div className="flex justify-between text-sm font-black mb-1">
                   <span>TOTAL</span>
                   <span>GHS {(order.total_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-6">
                   <span>Payment Method:</span>
                   <span className="uppercase">{order.payment_method?.replace(/_/g, ' ') || 'N/A'}</span>
                </div>

                {/* 5. FOOTER */}
                <div className="text-center space-y-2">
                   {/* Fake Barcode */}
                   <div className="h-8 bg-slate-900 w-3/4 mx-auto mb-2 opacity-80"></div>
                   <p className="font-bold">THANK YOU FOR SHOPPING!</p>
                   <p className="text-[9px]">No refunds after 7 days. Terms Apply.</p>
                   <p className="text-[9px] mt-2">{settings['site_url']}</p>
                </div>

             </div>
         </div>

         {/* DOWNLOAD BUTTON */}
         <button 
           onClick={handleDownload}
           disabled={generating}
           className="w-full py-4 bg-[#0A2540] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg"
         >
             {generating ? <Loader2 className="animate-spin"/> : <Download size={20} />} 
             {generating ? "Printing..." : "Download Image"}
         </button>

       </div>
    </div>
  );
};