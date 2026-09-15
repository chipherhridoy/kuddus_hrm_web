"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchApi } from "@/lib/api";
import { LeaveRequest } from "@/lib/types";

export default function LeavesPage() {
  const { user, isAdmin } = useAuth();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Apply Leave Modal State
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 3);
    return nextWeek.toISOString().split("T")[0];
  });
  const [reason, setReason] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    fetchApi("/leaves")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: LeaveRequest[]) => {
        if (isMounted) {
          setLeaves(data);
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
      const res = await fetchApi(`/leaves/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setBannerMessage(`✅ Leave request #${id} has been ${status}.`);
        setRefreshKey((k) => k + 1);
      } else {
        setBannerMessage(`⚠️ Failed to update leave #${id}`);
      }
    } catch {
      setBannerMessage(`❌ Error updating leave #${id}`);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;

    if (new Date(endDate) < new Date(startDate)) {
      setBannerMessage("⚠️ End date cannot be before start date.");
      return;
    }

    setSubmitting(true);
    setBannerMessage(null);
    try {
      const res = await fetchApi("/leaves", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id,
          startDate,
          endDate,
          reason,
        }),
      });

      if (res.ok) {
        setBannerMessage("✅ Leave application submitted successfully!");
        setShowModal(false);
        setReason("");
        setRefreshKey((k) => k + 1);
      } else {
        const err = await res.json().catch(() => ({ message: "Failed to apply for leave" }));
        setBannerMessage(`⚠️ ${err.message || "Failed to submit leave."}`);
      }
    } catch {
      setBannerMessage("❌ Error submitting leave application.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayedLeaves =
    activeTab === "mine" && user
      ? leaves.filter((l) => l.userId === user.id)
      : leaves;

  const pendingCount = leaves.filter((l) => l.status === "Pending").length;
  const approvedCount = leaves.filter((l) => l.status === "Approved").length;

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leave Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review, approve, or submit employee leave requests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Apply for Leave</span>
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

      {/* Tabs & Metrics Bar */}
      <div className="corp-card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-1 sm:flex-none ${
              activeTab === "all"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Organization Requests ({leaves.length})
          </button>
          <button
            onClick={() => setActiveTab("mine")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-1 sm:flex-none ${
              activeTab === "mine"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Leave Requests
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {pendingCount} Pending Review
          </span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {approvedCount} Approved
          </span>
        </div>
      </div>

      {/* Leave Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="corp-card p-12 text-center text-slate-400">
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading leave records...</span>
            </div>
          </div>
        ) : displayedLeaves.length === 0 ? (
          <div className="corp-card p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <p className="text-sm font-medium text-slate-600">No leave requests found.</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &ldquo;Apply for Leave&rdquo; above to submit an application.
            </p>
          </div>
        ) : (
          displayedLeaves.map((leave) => (
            <div
              key={leave.id}
              className="corp-card p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 corp-card-hover"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs">
                    {(leave.userName || "U").charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {leave.userName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {leave.userDepartment} • {leave.userRole}
                    </p>
                  </div>
                  <span
                    className={`ml-auto sm:ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      leave.status === "Pending"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : leave.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <p>
                    <span className="text-slate-400 font-medium">Duration: </span>
                    <strong className="font-mono text-slate-900 font-semibold">
                      {leave.startDate} → {leave.endDate}
                    </strong>
                  </p>
                  <p>
                    <span className="text-slate-400 font-medium">Submitted: </span>
                    <span className="font-mono text-slate-500">{leave.createdAt}</span>
                  </p>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic">
                  &ldquo;{leave.reason}&rdquo;
                </div>
              </div>

              {/* Admin Action Buttons */}
              {isAdmin && (
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {leave.status === "Pending" ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(leave.id, "Rejected")}
                        disabled={statusUpdatingId === leave.id}
                        className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {statusUpdatingId === leave.id ? "Updating..." : "Reject"}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(leave.id, "Approved")}
                        disabled={statusUpdatingId === leave.id}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                      >
                        {statusUpdatingId === leave.id ? "Updating..." : "Approve Leave"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          leave.id,
                          leave.status === "Approved" ? "Rejected" : "Approved"
                        )
                      }
                      disabled={statusUpdatingId === leave.id}
                      className="px-3.5 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                    >
                      Change to {leave.status === "Approved" ? "Rejected" : "Approved"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Submit Leave Application</h3>
                <p className="text-xs text-slate-500">Request time off from your management</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="corp-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="corp-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Reason for Leave
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., Medical treatment, Annual personal vacation..."
                  required
                  className="corp-input w-full"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-5 py-2 text-xs font-semibold rounded-xl disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
