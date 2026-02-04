"use client";

import React, { useState, useTransition } from 'react';
import { 
  CheckCircle, XCircle, Loader2, Clock, 
  MapPin, Store, FileText, Mail, 
  ExternalLink, ChevronDown, ChevronUp, ShieldCheck,
  MessageCircle, Copy, Key, Globe, X, DollarSign, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { approveApplication, rejectApplication } from '@/actions/application-actions';
import { verifyPayment } from '@/actions/payment-actions';
import { cn } from '@/lib/utils';

interface Application {
  id: string;
  legal_name: string | null;
  email: string | null;
  phone: string;
  digital_address: string | null;
  physical_address: string | null;
  id_card_url: string;
  business_name: string;
  business_slug: string;
  plan_id: string;
  status: string | null;
  rejection_reason: string | null;
  created_at: string | null;
  // Payment fields
  transaction_id: string | null;
  payment_amount: number | null;
  payment_date: string | null;
  payment_verified: boolean | null;
  payment_verified_at: string | null;
  payment_notes: string | null;
}

interface Credentials {
  email: string;
  password: string;
  storeUrl: string;
  storeName: string;
  whatsappNumber: string;
}

interface Props {
  applications: Application[];
}

export function PendingApplications({ applications }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const [verifyingPaymentId, setVerifyingPaymentId] = useState<string | null>(null);
  
  // Credentials modal state
  const [credentialsModal, setCredentialsModal] = useState<Credentials | null>(null);

  // Filter applications by payment status
  const pendingPayment = applications.filter(a => a.status === 'pending' && !a.transaction_id);
  const paymentSubmitted = applications.filter(a => a.status === 'payment_submitted' && !a.payment_verified);
  const paymentVerified = applications.filter(a => a.payment_verified && a.status !== 'approved' && a.status !== 'rejected');
  const processedApps = applications.filter(a => a.status === 'approved' || a.status === 'rejected');

  const handleVerifyPayment = (appId: string, verified: boolean, adminId: string) => {
    setVerifyingPaymentId(appId);
    startTransition(async () => {
      const result = await verifyPayment(appId, adminId, verified);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(verified ? 'Payment verified!' : 'Payment rejected');
      }
      setVerifyingPaymentId(null);
    });
  };

  const handleApprove = (app: Application) => {
    setProcessingId(app.id);
    startTransition(async () => {
      const result = await approveApplication(app.id);
      if (result.error) {
        toast.error(result.error);
      } else if (result.credentials) {
        // Show credentials modal
        setCredentialsModal({
          email: result.credentials.email,
          password: result.credentials.password,
          storeUrl: result.credentials.storeUrl,
          storeName: app.business_name,
          whatsappNumber: app.phone
        });
        toast.success(`✅ ${app.business_name} approved!`);
      }
      setProcessingId(null);
    });
  };

  const handleReject = () => {
    if (!rejectModalId || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setProcessingId(rejectModalId);
    startTransition(async () => {
      const result = await rejectApplication(rejectModalId, rejectReason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Application rejected');
      }
      setProcessingId(null);
      setRejectModalId(null);
      setRejectReason('');
    });
  };

  const formatWhatsAppNumber = (phone: string) => {
    // Remove spaces, dashes, and leading zeros
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // If starts with 0, replace with 233 (Ghana code)
    if (cleaned.startsWith('0')) {
      cleaned = '233' + cleaned.substring(1);
    }
    // If doesn't start with country code, add 233
    if (!cleaned.startsWith('233') && !cleaned.startsWith('+')) {
      cleaned = '233' + cleaned;
    }
    // Remove + if present
    cleaned = cleaned.replace('+', '');
    return cleaned;
  };

  const generateWhatsAppMessage = (creds: Credentials) => {
    const message = `🎉 *Welcome to NimdeShop!*

Your store *"${creds.storeName}"* is now LIVE!

🔐 *Login Credentials:*
📧 Email: ${creds.email}
🔑 Password: ${creds.password}

🌐 *Your Store:* ${creds.storeUrl}
📍 *Admin Panel:* nimdeshop.com/admin/login

⚠️ Please change your password after first login.

Need help? Reply to this message!`;
    return encodeURIComponent(message);
  };

  const openWhatsApp = () => {
    if (!credentialsModal) return;
    const formattedNumber = formatWhatsAppNumber(credentialsModal.whatsappNumber);
    const message = generateWhatsAppMessage(credentialsModal);
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
  };

  const copyCredentials = () => {
    if (!credentialsModal) return;
    const text = `Email: ${credentialsModal.email}\nPassword: ${credentialsModal.password}\nStore: ${credentialsModal.storeUrl}`;
    navigator.clipboard.writeText(text);
    toast.success('Credentials copied!');
  };

  const getPlanBadge = (planId: string) => {
    const plans: Record<string, { label: string; color: string }> = {
      free: { label: 'Free', color: 'bg-slate-100 text-slate-600' },
      starter: { label: 'Starter ₵250', color: 'bg-blue-100 text-blue-700' },
      growth: { label: 'Growth ₵450', color: 'bg-purple-100 text-purple-700' },
      pro: { label: 'Pro ₵1200', color: 'bg-amber-100 text-amber-700' },
    };
    const plan = plans[planId] || plans.free;
    return <span className={`px-2 py-0.5 rounded text-xs font-bold ${plan.color}`}>{plan.label}</span>;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Applications Requiring Action */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Clock size={18} className="text-amber-500" /> 
            Pending Review
          </h3>
          <div className="flex gap-2">
            {pendingPayment.length > 0 && (
              <span className="text-xs font-bold bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                {pendingPayment.length} No Payment
              </span>
            )}
            {paymentSubmitted.length > 0 && (
              <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                {paymentSubmitted.length} Verify Payment
              </span>
            )}
            {paymentVerified.length > 0 && (
              <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded-full">
                {paymentVerified.length} Ready to Approve
              </span>
            )}
          </div>
        </div>

        {pendingPayment.length === 0 && paymentSubmitted.length === 0 && paymentVerified.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No pending applications</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {[...paymentVerified, ...paymentSubmitted, ...pendingPayment].map((app) => (
              <div key={app.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Summary Row */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Store size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{app.business_name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{app.legal_name}</span>
                        <span>•</span>
                        <span className="text-indigo-600">nimdeshop.com/{app.business_slug}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getPlanBadge(app.plan_id)}
                    <span className="text-xs text-slate-400">{formatDate(app.created_at)}</span>
                    {expandedId === app.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === app.id && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-slate-50 rounded-xl p-5 space-y-4 border border-slate-100">
                      
                      {/* Contact Info */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-slate-400" />
                          <span className="text-slate-600">{app.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MessageCircle size={14} className="text-green-500" />
                          <span className="text-slate-600">{app.phone}</span>
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">WhatsApp</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className="text-slate-400" />
                          <span className="text-slate-600">{app.digital_address || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Physical Address */}
                      {app.physical_address && (
                        <div className="text-sm text-slate-500">
                          <span className="font-medium text-slate-700">Address:</span> {app.physical_address}
                        </div>
                      )}

                      {/* ID Document */}
                      <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-blue-500" />
                          <span className="text-sm font-medium text-slate-700">ID Document</span>
                        </div>
                        <a 
                          href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${app.id_card_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          View Document <ExternalLink size={12} />
                        </a>
                      </div>

                      {/* Payment Info */}
                      {app.transaction_id ? (
                        <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <DollarSign size={16} className="text-green-600" />
                              <span className="text-sm font-bold text-slate-900">Payment Submitted</span>
                            </div>
                            {app.payment_verified ? (
                              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                ✓ Verified
                              </span>
                            ) : (
                              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                Pending Verification
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Transaction ID:</span>
                              <span className="font-mono font-bold text-slate-900">{app.transaction_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Amount:</span>
                              <span className="font-bold text-green-600">
                                GHS {app.payment_amount?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Submitted:</span>
                              <span className="text-slate-700">{formatDate(app.payment_date)}</span>
                            </div>
                          </div>
                          
                          {/* Verify Payment Button */}
                          {!app.payment_verified && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Confirm you have verified this payment in your MoMo account?')) {
                                  // We need to get current admin ID - for now use a placeholder
                                  // In production, get from auth context
                                  handleVerifyPayment(app.id, true, 'admin-id-placeholder');
                                }
                              }}
                              disabled={verifyingPaymentId === app.id}
                              className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                            >
                              {verifyingPaymentId === app.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                              Verify Payment
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 flex items-start gap-3">
                          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-sm font-bold text-amber-900 mb-1">Awaiting Payment</div>
                            <div className="text-xs text-amber-700">
                              Applicant has not submitted payment proof yet. They will receive payment instructions after form submission.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleApprove(app); }}
                          disabled={processingId === app.id || !app.payment_verified}
                          className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-green-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!app.payment_verified ? 'Payment must be verified first' : ''}
                        >
                          {processingId === app.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          Approve & Create Store
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setRejectModalId(app.id); }}
                          disabled={processingId === app.id}
                          className="px-6 bg-red-50 text-red-600 py-2.5 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Applications (Collapsed by default) */}
      {processedApps.length > 0 && (
        <details className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <summary className="p-6 cursor-pointer hover:bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" /> 
              Processed Applications
            </h3>
            <span className="text-xs font-medium text-slate-500">{processedApps.length} total</span>
          </summary>
          <div className="border-t border-slate-100 divide-y divide-slate-100">
            {processedApps.map((app) => (
              <div key={app.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    app.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                  )}>
                    {app.status === 'approved' ? (
                      <CheckCircle size={14} className="text-green-600" />
                    ) : (
                      <XCircle size={14} className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{app.business_name}</div>
                    <div className="text-xs text-slate-500">{app.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded",
                    app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  )}>
                    {app.status?.toUpperCase()}
                  </span>
                  {app.rejection_reason && (
                    <div className="text-xs text-red-500 mt-1 max-w-[200px] truncate">
                      {app.rejection_reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reject Application</h3>
            <p className="text-sm text-slate-500 mb-4">
              Please provide a reason for rejection. This will be sent to the applicant.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Invalid ID document, incomplete information..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setRejectModalId(null); setRejectReason(''); }}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isPending || !rejectReason.trim()}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-red-500 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎉 CREDENTIALS MODAL - WhatsApp Flow */}
      {credentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
            
            {/* Success Header */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
            
            <button 
              onClick={() => setCredentialsModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Store Created! 🎉</h2>
              <p className="text-slate-500 mt-1">Send credentials via WhatsApp</p>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Store size={14}/> Store</span>
                <span className="font-bold">{credentialsModal.storeName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Mail size={14}/> Email</span>
                <span className="font-mono">{credentialsModal.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Key size={14}/> Password</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded">{credentialsModal.password}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-700">
                <span className="text-slate-400 flex items-center gap-2"><Globe size={14}/> URL</span>
                <span className="text-green-400 font-medium">{credentialsModal.storeUrl}</span>
              </div>
            </div>

            {/* WhatsApp Delivery Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div className="text-sm">
                <span className="font-bold text-green-800">Send to:</span>
                <span className="text-green-700 ml-2 font-mono">{credentialsModal.whatsappNumber}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={copyCredentials}
                className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
              >
                <Copy size={16} /> Copy
              </button>
              <button
                onClick={openWhatsApp}
                className="flex-[2] bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#20bd5a] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20"
              >
                <MessageCircle size={18} /> Send via WhatsApp
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">
              Click the button above to open WhatsApp with the message ready
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
