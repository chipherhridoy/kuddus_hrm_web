"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { fetchApi } from "@/lib/api";
import { AttendanceStats, AttendanceRecord, LeaveRequest } from "@/lib/types";
import StatCard from "@/components/StatCard";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  const [stats, setStats] = useState<AttendanceStats>({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    onLeaveToday: 0,
    wfhToday: 0,
  });
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchNotes, setPunchNotes] = useState("");
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [myTodayRecord, setMyTodayRecord] = useState<AttendanceRecord | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchApi("/attendance/stats").then((r) => (r.ok ? r.json() : null)),
      fetchApi("/attendance").then((r) => (r.ok ? r.json() : [])),
      fetchApi("/leaves").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([statsData, recordsData, leavesData]) => {
        if (!isMounted) return;
        if (statsData) setStats(statsData);
        if (recordsData) {
          setRecords(recordsData);
          if (user) {
            const todayStr = new Date().toISOString().split("T")[0];
            const mine = (recordsData as AttendanceRecord[]).find(
              (r) => r.userId === user.id && r.date === todayStr
            );
            setMyTodayRecord(mine || null);
          }
        }
        if (leavesData) {
          const pending = (leavesData as LeaveRequest[]).filter((l) => l.status === "Pending");
          setPendingLeaves(pending);
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleCheckIn = async () => {
    if (!user) return;
    setPunchLoading(true);
    setBannerMessage(null);
    try {
      const res = await fetchApi("/attendance/checkin", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          notes: punchNotes || "Web dashboard clock-in",
          latitude: 23.8103,
          longitude: 90.4125,
        }),
      });

      if (res.ok) {
        setBannerMessage("✅ Clocked in successfully for today!");
        setPunchNotes("");
        setRefreshKey((k) => k + 1);
      } else {
        const err = await res.json().catch(() => ({ message: "Check-in failed" }));
        setBannerMessage(`⚠️ ${err.message || "Failed to clock in."}`);
      }
    } catch {
      setBannerMessage("❌ Error communicating with backend server.");
    } finally {
      setPunchLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    setPunchLoading(true);
    setBannerMessage(null);
    try {
      const res = await fetchApi("/attendance/checkout", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          notes: punchNotes || "Web dashboard clock-out",
        }),
      });

      if (res.ok) {
        setBannerMessage("✅ Clocked out successfully!");
        setPunchNotes("");
        setRefreshKey((k) => k + 1);
      } else {
        const err = await res.json().catch(() => ({ message: "Check-out failed" }));
        setBannerMessage(`⚠️ ${err.message || "Failed to clock out."}`);
      }
    } catch {
      setBannerMessage("❌ Error communicating with backend server.");
    } finally {
      setPunchLoading(false);
    }
  };

  const handleLeaveAction = async (id: number, status: "Approved" | "Rejected") => {
    try {
      const res = await fetchApi(`/leaves/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setBannerMessage(`✅ Leave #${id} marked as ${status}`);
        setRefreshKey((k) => k + 1);
      } else {
        setBannerMessage(`⚠️ Failed to update leave #${id}`);
      }
    } catch {
      setBannerMessage(`❌ Error updating leave #${id}`);
    }
  };

  return (
    <div className="space-y-8 animate-in">
      {/* Header with Greeting & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here is your workforce activity and attendance summary.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-2"
        >
          <svg
            className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh Data</span>
        </button>
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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Workforce"
          value={stats.totalEmployees}
          subtitle="Registered staff accounts"
          badgeText="Active Org"
          variant="indigo"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        <StatCard
          title="Present Today"
          value={stats.presentToday}
          subtitle="Active on-shift staff"
          badgeText="On Track"
          variant="emerald"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Remote (WFH)"
          value={stats.wfhToday ?? 0}
          subtitle="Approved WFH today"
          badgeText="Remote"
          variant="blue"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />

        <StatCard
          title="Late Arrivals"
          value={stats.lateToday}
          subtitle="Clock-ins after 9:15 AM"
          badgeText="Flagged"
          variant="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Approved On Leave"
          value={stats.onLeaveToday}
          subtitle="Scheduled absence today"
          badgeText="Scheduled"
          variant="purple"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Interactive Punch Hub & Admin Approvals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Attendance Action Card */}
        <div className="corp-card p-6 bg-white border border-slate-200 rounded-2xl shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personal Punch Clock</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your status for today</p>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                  myTodayRecord?.checkOutTime
                    ? "bg-slate-50 text-slate-700 border-slate-200"
                    : myTodayRecord?.checkInTime
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {myTodayRecord?.checkOutTime
                  ? "Completed"
                  : myTodayRecord?.checkInTime
                  ? "Active On Shift"
                  : "Not Clocked In"}
              </span>
            </div>

            <div className="py-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Clock In</p>
                  <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {myTodayRecord?.checkInTime || "--:--"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Clock Out</p>
                  <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {myTodayRecord?.checkOutTime || "--:--"}
                  </p>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Optional punch note (e.g. Remote work)"
                  value={punchNotes}
                  onChange={(e) => setPunchNotes(e.target.value)}
                  className="corp-input w-full text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            {!myTodayRecord?.checkInTime ? (
              <button
                onClick={handleCheckIn}
                disabled={punchLoading}
                className="w-full btn-primary py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>{punchLoading ? "Submitting..." : "Clock In Now"}</span>
              </button>
            ) : !myTodayRecord?.checkOutTime ? (
              <button
                onClick={handleCheckOut}
                disabled={punchLoading}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{punchLoading ? "Submitting..." : "Clock Out"}</span>
              </button>
            ) : (
              <div className="text-center py-2 text-xs font-medium text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                Shift complete for today. See you tomorrow!
              </div>
            )}
          </div>
        </div>

        {/* Admin Quick Leave Approvals Widget OR Recent Stats */}
        <div className="corp-card p-6 bg-white border border-slate-200 rounded-2xl shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isAdmin ? "Urgent Leave Requests" : "Recent Leave Applications"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdmin
                  ? "Pending requests requiring manager review"
                  : "Status of your recent applications"}
              </p>
            </div>
            <Link
              href="/leaves"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View All Leaves →
            </Link>
          </div>

          <div className="py-3 flex-1 overflow-y-auto space-y-3 max-h-56">
            {pendingLeaves.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No pending leave requests at this time.
              </div>
            ) : (
              pendingLeaves.slice(0, 3).map((leave) => (
                <div
                  key={leave.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{leave.userName}</span>
                      <span className="text-[10px] text-slate-400">• {leave.userDepartment}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 italic">
                      &ldquo;{leave.reason}&rdquo;
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 mt-1">
                      {leave.startDate} → {leave.endDate}
                    </p>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => handleLeaveAction(leave.id, "Rejected")}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleLeaveAction(leave.id, "Approved")}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Attendance Log Table */}
      <div className="corp-card bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Attendance Feed</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Today&apos;s real-time employee check-in stream stored in Cloud PostgreSQL
            </p>
          </div>
          <Link
            href="/attendance"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Full Attendance Log ({records.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Check-In</th>
                <th className="px-6 py-3.5">Check-Out</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No attendance records found yet today.
                  </td>
                </tr>
              ) : (
                records.slice(0, 5).map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">
                      {record.userName}
                      <span className="block text-[11px] font-normal text-slate-400">{record.userRole}</span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{record.userDepartment}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">{record.date}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-900 font-semibold">{record.checkInTime}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">{record.checkOutTime || "--:--"}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          record.status === "Present"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : record.status === "Late"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 truncate max-w-xs">
                      {record.notes || "Standard check-in"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
