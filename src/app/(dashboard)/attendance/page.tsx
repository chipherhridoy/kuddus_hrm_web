"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchApi } from "@/lib/api";
import { AttendanceRecord } from "@/lib/types";
import { useAttendanceSignalR, LiveAttendanceEvent } from "@/lib/signalr";

export default function AttendancePage() {
  const { user, isAdmin } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Present" | "Late">("All");
  const [liveNotice, setLiveNotice] = useState<{ text: string; key: number } | null>(null);
  const [recentlyUpdatedUserId, setRecentlyUpdatedUserId] = useState<number | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleLiveAttendance = useCallback(
    (event: LiveAttendanceEvent) => {
      if (!isAdmin && user?.id !== event.userId) {
        return;
      }

      const timeStr = new Date(event.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const noticeText =
        event.type === "CHECK_IN"
          ? `⚡ Live Scan: ${event.userName} checked in (${event.status}) at ${timeStr}`
          : `⚡ Live Scan: ${event.userName} clocked out at ${timeStr}`;

      setLiveNotice({ text: noticeText, key: Date.now() });
      setRecentlyUpdatedUserId(event.userId);

      const recordDate = new Date(event.timestamp).toISOString().split("T")[0];

      if (event.type === "CHECK_IN") {
        setRecords((prev) => {
          const exists = prev.some((r) => r.userId === event.userId && r.date === recordDate);
          if (exists) {
            return prev.map((r) =>
              r.userId === event.userId && r.date === recordDate
                ? { ...r, checkInTime: event.timestamp, status: event.status, notes: event.notes || r.notes }
                : r
            );
          }
          const newRec: AttendanceRecord = {
            id: Date.now(),
            userId: event.userId,
            userName: event.userName,
            userRole: event.userRole || "Staff",
            userDepartment: "General",
            date: recordDate,
            checkInTime: event.timestamp,
            checkOutTime: null,
            status: event.status,
            notes: event.notes || "Real-time punch",
            latitude: event.latitude,
            longitude: event.longitude,
          };
          return [newRec, ...prev];
        });
      } else if (event.type === "CHECK_OUT") {
        setRecords((prev) =>
          prev.map((r) =>
            r.userId === event.userId && r.date === recordDate
              ? { ...r, checkOutTime: event.timestamp }
              : r
          )
        );
      }
    },
    [isAdmin, user]
  );

  const { isConnected } = useAttendanceSignalR(handleLiveAttendance);

  useEffect(() => {
    if (!liveNotice) return;
    const t = setTimeout(() => {
      setLiveNotice(null);
      setRecentlyUpdatedUserId(null);
    }, 6000);
    return () => clearTimeout(t);
  }, [liveNotice]);

  useEffect(() => {
    let isMounted = true;
    const endpoint = isAdmin ? "/attendance" : `/attendance/user/${user?.id}`;

    fetchApi(endpoint)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AttendanceRecord[]) => {
        if (isMounted) {
          setRecords(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAdmin, user, refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      (rec.userName || "").toLowerCase().includes(search.toLowerCase()) ||
      (rec.userDepartment || "").toLowerCase().includes(search.toLowerCase()) ||
      rec.date.includes(search);

    const matchesStatus =
      statusFilter === "All" ? true : rec.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const presentCount = records.filter((r) => r.status === "Present").length;
  const lateCount = records.filter((r) => r.status === "Late").length;

  return (
    <div className="space-y-6 animate-in">
      {/* Page Title & Summary Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isAdmin
              ? "Comprehensive workforce punch logs and verification records"
              : "Your complete daily attendance and check-in history"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
            title={
              isConnected
                ? "Live WebSocket connected. Automatic real-time updates enabled."
                : "Connecting to real-time attendance hub..."
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span>{isConnected ? "Live Sync Active" : "Connecting..."}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-2"
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
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {liveNotice && (
        <div
          key={liveNotice.key}
          className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white text-xs font-medium flex items-center justify-between shadow-lg border border-emerald-700/50 animate-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-300">Live Sync:</span>
            <span>{liveNotice.text}</span>
          </div>
          <button
            onClick={() => setLiveNotice(null)}
            className="text-xs text-slate-300 hover:text-white px-2 py-1 rounded transition-colors font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="corp-card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, dept, or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="corp-input w-full pl-10 text-xs py-2"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {(["All", "Present", "Late"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-1 sm:flex-none ${
                  statusFilter === tab
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Counters */}
        <div className="flex items-center gap-3 text-xs self-start md:self-auto">
          <span className="text-slate-500">
            Showing <strong className="text-slate-900">{filteredRecords.length}</strong> of {records.length} records
          </span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {presentCount} Present
          </span>
          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {lateCount} Late
          </span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="corp-card bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check-In</th>
                <th className="px-6 py-4">Check-Out</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Location / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading attendance logs from Cloud DB...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No attendance records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const isRecent = record.userId === recentlyUpdatedUserId;
                  return (
                    <tr
                      key={record.id}
                      className={`transition-all duration-700 ${
                        isRecent
                          ? "bg-emerald-50/90 ring-1 ring-inset ring-emerald-300"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-[10px] ${
                              isRecent
                                ? "bg-emerald-600 text-white border-emerald-500 animate-pulse"
                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}
                          >
                            {(record.userName || "U").charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{record.userName || `User #${record.userId}`}</span>
                              {isRecent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wide bg-emerald-600 text-white animate-bounce">
                                  Just Now
                                </span>
                              )}
                            </div>
                            <span className="block text-[10px] font-normal text-slate-400">
                              {record.userRole || "Staff"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{record.userDepartment || "General"}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{record.date}</td>
                      <td className="px-6 py-4 font-mono text-slate-900 font-semibold">{formatTime(record.checkInTime)}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{formatTime(record.checkOutTime)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            record.status.includes("WFH")
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : record.status === "Present"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : record.status === "Late"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                        {record.notes || "Standard check-in"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatTime(val?: string | null) {
  if (!val) return "--:--";
  if (val.includes("T")) {
    try {
      return new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return val;
    }
  }
  return val;
}
