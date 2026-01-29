"use client";

import { useState } from "react";
import { createExpert, updateExpertStatus } from "@/actions/expert-actions";
import { assignExpertToRequest, updateRequestStatus, recordPayment } from "@/app/admin/super/experts/actions";
import { UserPlus, Mail, Lock, Tag, Users, DollarSign, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

type Expert = {
  id: string;
  user_id: string;
  name: string;
  bio: string | null;
  specialties: string[];
  avatar_url: string | null;
  status: string;
  jobs_completed: number;
  rating: number;
  created_at: string;
};

type ExpertRequest = {
  id: string;
  store_id: string;
  requester_id: string;
  service_type: string;
  contact_phone: string;
  status: string;
  stores: { name: string; slug: string } | null;
  selected_expert: { name: string; avatar_url: string | null } | null;
  assigned_expert: { name: string; avatar_url: string | null } | null;
  total_amount: number;
  platform_fee: number;
  expert_payout: number;
  payment_status: string;
  payment_reference: string | null;
  created_at: string;
};

export function ExpertsManagement({ 
  experts: initialExperts, 
  requests: initialRequests 
}: { 
  experts: Expert[]; 
  requests: ExpertRequest[] 
}) {
  const [view, setView] = useState<"experts" | "requests">("experts");
  const [experts, setExperts] = useState(initialExperts);
  const [requests, setRequests] = useState(initialRequests);
  
  // Create Expert Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    bio: "",
    specialties: [] as string[],
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const specialtyOptions = [
    { value: "setup", label: "Store Setup", color: "bg-blue-100 text-blue-700" },
    { value: "products", label: "Product Management", color: "bg-green-100 text-green-700" },
    { value: "design", label: "Design & Branding", color: "bg-purple-100 text-purple-700" },
    { value: "marketing", label: "Marketing", color: "bg-orange-100 text-orange-700" },
  ];

  const handleCreateExpert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.specialties.length === 0) {
      setCreateError("Select at least one specialty");
      return;
    }

    setCreating(true);
    setCreateError("");

    // Convert to FormData object
    const fd = new FormData();
    fd.append("email", formData.email);
    fd.append("password", formData.password);
    fd.append("name", formData.name);
    fd.append("bio", formData.bio);
    formData.specialties.forEach((s) => fd.append("specialties", s));

    const result = await createExpert(fd);

    if (result.error) {
      setCreateError(result.error);
      setCreating(false);
      return;
    }

    // Refresh experts list
    window.location.reload();
  };

  const toggleExpertStatus = async (expertId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await updateExpertStatus(expertId, newStatus);
    
    setExperts(experts.map(e => 
      e.id === expertId ? { ...e, status: newStatus } : e
    ));
  };

  const handleAssignExpert = async (requestId: string, expertId: string) => {
    await assignExpertToRequest(requestId, expertId);
    window.location.reload();
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    await updateRequestStatus(requestId, newStatus);
    window.location.reload();
  };

  const handleRecordPayment = async (requestId: string, reference: string) => {
    await recordPayment(requestId, reference);
    window.location.reload();
  };

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

  return (
    <div className="space-y-6">
      
      {/* VIEW TOGGLE */}
      <div className="flex gap-3 border-b border-slate-200">
        <button
          onClick={() => setView("experts")}
          className={`pb-3 px-4 font-semibold transition-colors border-b-2 ${
            view === "experts"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            Experts ({experts.length})
          </div>
        </button>
        <button
          onClick={() => setView("requests")}
          className={`pb-3 px-4 font-semibold transition-colors border-b-2 ${
            view === "requests"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign size={18} />
            Requests ({requests.length})
          </div>
        </button>
      </div>

      {/* EXPERTS VIEW */}
      {view === "experts" && (
        <div className="space-y-4">
          
          {/* CREATE EXPERT BUTTON */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            <UserPlus size={18} />
            Train New Expert
          </button>

          {/* EXPERTS LIST */}
          <div className="grid gap-4 md:grid-cols-2">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className="p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {expert.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{expert.name}</h3>
                      <p className="text-xs text-slate-500">
                        {expert.jobs_completed} jobs • {expert.rating}★
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpertStatus(expert.id, expert.status)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      expert.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {expert.status}
                  </button>
                </div>

                {expert.bio && (
                  <p className="text-sm text-slate-600 mb-3">{expert.bio}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {expert.specialties.map((specialty) => {
                    const option = specialtyOptions.find((o) => o.value === specialty);
                    return (
                      <span
                        key={specialty}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          option?.color || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {option?.label || specialty}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REQUESTS VIEW */}
      {view === "requests" && (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="p-5 bg-white border border-slate-200 rounded-xl space-y-4"
            >
              {/* HEADER */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {request.stores?.name || "Unknown Store"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {specialtyOptions.find((o) => o.value === request.service_type)?.label || request.service_type}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {request.contact_phone}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(request.status)}`}>
                    {request.status.replace(/_/g, " ")}
                  </span>
                  <span className={`block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(request.payment_status)}`}>
                    {request.payment_status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* PAYMENT INFO */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="font-bold text-slate-900">GHS {request.total_amount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Platform Fee</p>
                  <p className="font-bold text-orange-600">GHS {request.platform_fee}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Expert Payout</p>
                  <p className="font-bold text-green-600">GHS {request.expert_payout}</p>
                </div>
              </div>

              {/* EXPERT ASSIGNMENT */}
              {!request.assigned_expert && request.status === "pending" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Assign Expert:</label>
                  <select
                    onChange={(e) => handleAssignExpert(request.id, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select an expert...</option>
                    {experts
                      .filter((e) => e.status === "active")
                      .map((expert) => (
                        <option key={expert.id} value={expert.id}>
                          {expert.name} - {expert.specialties.join(", ")}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {request.assigned_expert && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Assigned to: {request.assigned_expert.name}
                  </span>
                </div>
              )}

              {/* PAYMENT RECORDING */}
              {request.payment_status === "unpaid" && request.assigned_expert && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Record Payment Reference:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., MOMO-123456789"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            handleRecordPayment(request.id, input.value.trim());
                          }
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input.value.trim()) {
                          handleRecordPayment(request.id, input.value.trim());
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Record
                    </button>
                  </div>
                </div>
              )}

              {/* STATUS ACTIONS */}
              <div className="flex gap-2 pt-3 border-t border-slate-200">
                {request.payment_status === "escrowed" && request.status === "payment_received" && (
                  <button
                    onClick={() => handleUpdateStatus(request.id, "in_progress")}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-semibold"
                  >
                    Authorize Work Start
                  </button>
                )}
                {request.status === "in_progress" && (
                  <button
                    onClick={() => handleUpdateStatus(request.id, "completed")}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-semibold"
                  >
                    Mark Complete & Release Payment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE EXPERT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-900">Train New Expert</h2>

            <form onSubmit={handleCreateExpert} className="space-y-4">
              
              {/* EMAIL */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                    placeholder="expert@example.com"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                    placeholder="Minimum 8 characters"
                    minLength={8}
                  />
                </div>
              </div>

              {/* NAME */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="John Doe"
                />
              </div>

              {/* BIO */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Bio (Optional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg resize-none"
                  rows={3}
                  placeholder="Expert in ecommerce setup and product management..."
                />
              </div>

              {/* SPECIALTIES */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Specialties (Select at least one)
                </label>
                <div className="space-y-2">
                  {specialtyOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              specialties: [...formData.specialties, option.value],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              specialties: formData.specialties.filter((s) => s !== option.value),
                            });
                          }
                        }}
                        className="w-4 h-4 text-orange-500"
                      />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ERROR */}
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {createError}
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-semibold"
                >
                  {creating ? "Creating..." : "Create Expert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
