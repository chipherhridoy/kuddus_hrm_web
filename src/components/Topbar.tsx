"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchApi } from "@/lib/api";

interface TopbarProps {
  onOpenCopilot?: () => void;
  onRefreshData?: () => void;
}

export default function Topbar({ onRefreshData }: TopbarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [punchLoading, setPunchLoading] = useState(false);
  const [todayStatus, setTodayStatus] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check today's user attendance
  useEffect(() => {
    if (!user) return;
    let ignore = false;

    async function checkTodayAttendance() {
      try {
        const res = await fetchApi(`/attendance/user/${user?.id}`);
        if (!ignore && res.ok) {
          const records = await res.json();
          if (records.length > 0) {
            const todayStr = new Date().toISOString().split("T")[0];
            const todayRecord = records.find((r: { date: string }) => r.date === todayStr);
            if (todayRecord) {
              if (todayRecord.checkOutTime) {
                setTodayStatus("Checked Out");
              } else {
                setTodayStatus("Checked In");
              }
            } else {
              setTodayStatus("Not Clocked In");
            }
          } else {
            setTodayStatus("Not Clocked In");
          }
        }
      } catch {
        // ignore
      }
    }

    checkTodayAttendance();
    return () => {
      ignore = true;
    };
  }, [user]);

  const handleQuickPunch = async () => {
    if (!user) return;
    setPunchLoading(true);
    try {
      if (todayStatus === "Checked In") {
        const res = await fetchApi("/attendance/checkout", {
          method: "POST",
          body: JSON.stringify({ userId: user.id, notes: "Web Topbar Punch Out" }),
        });
        if (res.ok) {
          setTodayStatus("Checked Out");
          onRefreshData?.();
        }
      } else {
        const res = await fetchApi("/attendance/checkin", {
          method: "POST",
          body: JSON.stringify({
            userId: user.id,
            notes: "Web Topbar Punch In",
            latitude: 23.8103,
            longitude: 90.4125,
          }),
        });
        if (res.ok) {
          setTodayStatus("Checked In");
          onRefreshData?.();
        }
      }
    } catch {
      // ignore
    } finally {
      setPunchLoading(false);
    }
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/attendance")) return "Attendance Center";
    if (pathname.startsWith("/leaves")) return "Leave Management";
    if (pathname.startsWith("/employees")) return "Employee Directory";
    return "Dashboard Overview";
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Page Title & Breadcrumb */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 leading-none">{getPageTitle()}</h2>
        <p className="text-[11px] text-slate-400 mt-1">Kuddus HRM Platform</p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{currentTime || "--:--:--"}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{currentDate}</span>
        </div>

        {/* Quick Punch Button */}
        <button
          onClick={handleQuickPunch}
          disabled={punchLoading || todayStatus === "Checked Out"}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
            todayStatus === "Checked In"
              ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
              : todayStatus === "Checked Out"
              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              : "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
          }`}
          title={
            todayStatus === "Checked In"
              ? "Clock Out now"
              : todayStatus === "Checked Out"
              ? "Already completed today"
              : "Clock In now"
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              todayStatus === "Checked In"
                ? "bg-amber-500"
                : todayStatus === "Checked Out"
                ? "bg-slate-400"
                : "bg-emerald-500"
            }`}
          ></span>
          <span>
            {punchLoading
              ? "Processing..."
              : todayStatus === "Checked In"
              ? "Clock Out"
              : todayStatus === "Checked Out"
              ? "Clocked Out"
              : "Quick Clock In"}
          </span>
        </button>
      </div>
    </header>
  );
}
