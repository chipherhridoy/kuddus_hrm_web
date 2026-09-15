"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchApi } from "@/lib/api";
import { WfhRequest } from "@/lib/types";

export default function WfhPage() {
  const { user, isAdmin } = useAuth();

  const [requests, setRequests] = useState<WfhRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Approved" | "Rejected">("all");
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Apply Modal State
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [reason, setReason] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    fetchApi("/wfh")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: WfhRequest[]) => {
        if (isMounted) {
          setRequests(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleUpdateStatus = async (id: number, status: "Approved" | "Rejected") => {
    setStatusUpdatingId(id);
    setBannerMessage(null);
    try {
      const res = await fetchApi(`/wfh/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setBannerMessage(`✅ WFH request #${id} has been ${status}.`);
        setRefreshKey((k) => k + 1);
      } else {
        const err = await res.json().catch(() => ({ message: "Failed to update status" }));
        setBannerMessage(`⚠️ ${err.message || "Failed to update WFH request"}`);
      }
    } catch {
      setBannerMessage(`❌ Error updating WFH request #${id}`);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleCreateWfh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;

    if (new Date(endDate) < new Date(startDate)) {
      setBannerMessage("⚠️ End date cannot be before start date.");
      return;
    }

    setSubmitting(true);
    setBannerMessage(null);
    try {
      const res = await fetchApi("/wfh", {
        method: "POST",
        body: JSON.stringify({
          startDate,
          endDate,
          reason,
        }),
      });

      if (res.ok) {
        setBannerMessage("✅ Work from home application submitted successfully!");
        setShowModal(false);
        setReason("");
        setRefreshKey((k) => k + 1);
      } else {
        const err = await res.json().catch(() => ({ message: "Failed to apply for WFH" }));
        setBannerMessage(`⚠️ ${err.message || "Failed to submit WFH application."}`);
      }
    } catch {
      setBannerMessage("❌ Error submitting WFH application.");
    } finally {
      setSubmitting(false);
    }
  };

  // Duration calculation
  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Filter logic
  const displayed = requests
    .filter((r) => (activeTab === "mine" && user ? r.userId === user.id : true))
    .filter((r) => (statusFilter === "all" ? true : r.status === statusFilter));

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const myTotal = user ? requests.filter((r) => r.userId === user.id).length : 0;

  // Check active today
  const todayStr = new Date().toISOString().split("T")[0];
  const activeTodayCount = requests.filter(
    (r) => r.status === "Approved" && r.startDate <= todayStr && r.endDate >= todayStr
  ).length;

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Work From Home (WFH)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Apply for remote work schedules and manage team approvals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-600/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Apply for WFH</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between shadow-sm">
          <span>{bannerMessage}</span>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-xs text-slate-400 hover:text-white px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="corp-card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{pendingCount}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Awaiting manager action</p>
        </div>

        <div className="corp-card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Approved WFH</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{approvedCount}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Authorized remote work</p>
        </div>

        <div className="corp-card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Remote Today</span>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{activeTodayCount}</p>
          <p className="text-[11px] text-indigo-700 font-medium mt-0.5">Working from home today</p>
        </div>

        <div className="corp-card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">My Applications</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{myTotal}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Your personal requests</p>
        </div>
      </div>

      {/* Tabs & Status Filter */}
      <div className="corp-card p-3 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-1 sm:flex-none ${
              activeTab === "all"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("mine")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-1 sm:flex-none ${
              activeTab === "mine"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Applications ({myTotal})
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(["all", "Pending", "Approved", "Rejected"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "all" ? "All Status" : st}
            </button>
          ))}
        </div>
      </div>

      {/* WFH Requests List */}
      <div className="space-y-3">
        {loading ? (
          <div className="corp-card p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading WFH records...</span>
            </div>
          </div>
        ) : displayed.length === 0 ? (
          <div className="corp-card p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <p className="text-sm font-medium text-slate-600">No Work From Home requests found.</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &ldquo;Apply for WFH&rdquo; above to submit an application.
            </p>
          </div>
        ) : (
          displayed.map((wfh) => {
            const days = calculateDays(wfh.startDate, wfh.endDate);
            const isApproved = wfh.status === "Approved";
            const isPending = wfh.status === "Pending";

            return (
              <div
                key={wfh.id}
                className="corp-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:border-indigo-200 hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs">
                      {(wfh.userName || "U").charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {wfh.userName || "Unknown Employee"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {wfh.userDepartment || "General"} • {wfh.userRole || "Staff"}
                      </p>
                    </div>

                    <span
                      className={`ml-auto md:ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                        isApproved
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isPending
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {wfh.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                    <div className="flex items-center gap-1.5 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {wfh.startDate} → {wfh.endDate}
                      </span>
                      <span className="text-indigo-600 font-bold">({days} {days === 1 ? "day" : "days"})</span>
                    </div>

                    <span className="text-slate-400">•</span>

                    <span className="text-slate-500">Applied: {wfh.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-700 mt-2.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-900">Reason: </span>
                    {wfh.reason}
                  </p>
                </div>

                {/* Manager Action Buttons */}
                {isAdmin && isPending && (
                  <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleUpdateStatus(wfh.id, "Approved")}
                      disabled={statusUpdatingId === wfh.id}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {statusUpdatingId === wfh.id ? (
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(wfh.id, "Rejected")}
                      disabled={statusUpdatingId === wfh.id}
                      className="px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Apply for WFH Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Apply for Work From Home</h2>
                  <p className="text-xs text-slate-500">Request remote schedule authorization</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWfh} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                <span className="text-indigo-900 font-medium">Estimated Remote Duration:</span>
                <span className="font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-2xs">
                  {calculateDays(startDate, endDate)} Working {calculateDays(startDate, endDate) === 1 ? "Day" : "Days"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Remote Work
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., High-focus engineering sprint, home maintenance, health check..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
