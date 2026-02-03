import Link from 'next/link';
import { CheckCircle, ShieldCheck } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-10 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
           <ShieldCheck className="text-green-600" size={40} />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-4">Application Submitted Successfully!</h1>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
           Thank you for applying to become a Nimde Merchant. 
           Your application has been received and is being reviewed by our compliance team.
           <br/><br/>
           <strong>Check your WhatsApp in 2-4 hours.</strong><br/>
           You will receive a message with your confirmation status and login credentials if approved.
        </p>

        <Link href="/" className="inline-flex font-bold text-indigo-600 hover:text-indigo-800">
           &larr; Return to Home
        </Link>
      </div>
    </div>
  );
}