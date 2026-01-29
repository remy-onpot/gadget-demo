"use client";

import { useState } from "react";
import { DollarSign, Phone, Calendar, Package, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";

type Expert = {
  id: string;
  name: string;
  bio: string | null;
  specialties: string[];
  jobs_completed: number;
  rating: number;
};

type ExpertRequest = {
  id: string;
  store_id: string;
  service_type: string;
  contact_phone: string;
  status: string;
  stores: { name: string; slug: string } | null;
  total_amount: number;
  platform_fee: number;
  expert_payout: number;
  payment_status: string;
  payment_reference: string | null;
  created_at: string;
  completion_proof_url: string | null;
};

const specialtyLabels: Record<string, string> = {
  setup: "Store Setup",
  products: "Product Management",
  design: "Design & Branding",
  marketing: "Marketing",
};

export function ExpertDashboardClient({
  expert,
  requests,
}: {
  expert: Expert;
  requests: ExpertRequest[];
}) {
  const [filter, setFilter] = useState<string>("all");

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      payment_received: "bg-blue-100 text-blue-700",
      in_progress: "bg-purple-100 text-purple-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700";
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const styles = {
      unpaid: "bg-red-100 text-red-700",
      escrowed: "bg-blue-100 text-blue-700",
      released_to_expert: "bg-green-100 text-green-700",
      refunded: "bg-orange-100 text-orange-700",
    };
    return styles[paymentStatus as keyof typeof styles] || "bg-gray-100 text-gray-700";
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending" || r.status === "payment_received").length,
    active: requests.filter((r) => r.status === "in_progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total Jobs</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-purple-600">{stats.active}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { key: "all", label: "All" },
          { key: "payment_received", label: "Ready to Start" },
          { key: "in_progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              filter === tab.key
                ? "bg-orange-500 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REQUESTS LIST */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="p-10 bg-white rounded-xl border border-slate-200 text-center text-slate-500">
            No jobs found in this category.
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="p-6 bg-white rounded-xl border border-slate-200 space-y-4 hover:shadow-md transition-shadow"
            >
              {/* HEADER */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {request.stores?.name || "Unknown Store"}
                  </h3>
                  <p className="text-slate-500">
                    {specialtyLabels[request.service_type] || request.service_type}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Requested {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                      request.status
                    )}`}
                  >
                    {request.status.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(
                      request.payment_status
                    )}`}
                  >
                    {request.payment_status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* PAYMENT INFO */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Your Payout</p>
                  <p className="text-2xl font-black text-green-600">
                    GHS {request.expert_payout}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Client Pays</p>
                  <p className="text-2xl font-black text-slate-900">
                    GHS {request.total_amount}
                  </p>
                  <p className="text-xs text-slate-400">
                    Platform fee: GHS {request.platform_fee}
                  </p>
                </div>
              </div>

              {/* CONTACT */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={16} />
                <a
                  href={`https://wa.me/${request.contact_phone.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-green-600 hover:underline"
                >
                  {request.contact_phone} (WhatsApp)
                </a>
              </div>

              {/* STORE LINK */}
              {request.stores?.slug && (
                <a
                  href={`https://${request.stores.slug}.nimdeshop.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  <ExternalLink size={16} />
                  Visit Store
                </a>
              )}

              {/* STATUS INDICATORS */}
              {request.status === "payment_received" && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Ready to Start</p>
                    <p className="text-sm text-blue-700">
                      Payment received and held in escrow. Contact the client to begin work.
                    </p>
                  </div>
                </div>
              )}

              {request.status === "in_progress" && (
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <AlertCircle size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900">Work In Progress</p>
                    <p className="text-sm text-purple-700">
                      Complete the scope and notify the super admin for payment release.
                    </p>
                  </div>
                </div>
              )}

              {request.status === "completed" && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Completed</p>
                    <p className="text-sm text-green-700">
                      Payment released: GHS {request.expert_payout}
                      {request.payment_reference && ` (Ref: ${request.payment_reference})`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
