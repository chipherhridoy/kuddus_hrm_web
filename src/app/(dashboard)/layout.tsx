"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import KuddusCopilot from "@/components/KuddusCopilot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [copilotOpen, setCopilotOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md animate-pulse">
            K
          </div>
          <p className="text-xs font-semibold text-slate-500">Loading Kuddus HRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onOpenCopilot={() => setCopilotOpen(true)} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Full-Circle Nodding Robot "Ask AI" Button (Bottom Right) */}
      {!copilotOpen && (
        <div className="fixed bottom-6 right-6 z-40 group">
          {/* Tooltip on Hover */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 px-3.5 py-2 bg-slate-900/90 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/60 pointer-events-none opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight">Ask Kuddus AI</span>
              <span className="text-[10px] text-indigo-300 font-medium">Gemini 2.5 • Assistant</span>
            </div>
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-t border-slate-700/60" />
          </div>

          {/* Outer glow ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300 animate-float-gentle" />

          {/* Full-Circle Button */}
          <button
            onClick={() => setCopilotOpen(true)}
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-2xl shadow-indigo-600/50 hover:shadow-indigo-600/80 flex items-center justify-center border-2 border-white/30 backdrop-blur-md transition-all duration-300 group-hover:scale-110 active:scale-95 animate-float-gentle cursor-pointer"
            aria-label="Ask Kuddus AI"
          >
            {/* Live Online Dot Badge */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-indigo-900 shadow-xs"></span>
            </span>

            {/* Nodding Robot SVG */}
            <svg
              className="w-10 h-10 overflow-visible drop-shadow-md"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Robot Body / Shoulders (Stationary Base) */}
              <path
                d="M14 38C14 33 18 31 24 31C30 31 34 33 34 38"
                stroke="#c7d2fe"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <rect x="21" y="27" width="6" height="4.5" rx="1.5" fill="#a5b4fc" />

              {/* Nodding Head Group (Nods rhythmically all the time) */}
              <g className="animate-robot-nod">
                {/* Antenna */}
                <line x1="24" y1="12" x2="24" y2="6.5" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="24" cy="5.5" r="2.5" fill="#f59e0b" className="animate-pulse" />

                {/* Ear Bolts */}
                <rect x="9.5" y="15.5" width="2.5" height="7" rx="1.2" fill="#93c5fd" />
                <rect x="36" y="15.5" width="2.5" height="7" rx="1.2" fill="#93c5fd" />

                {/* Head Face Screen */}
                <rect
                  x="12"
                  y="11"
                  width="24"
                  height="17"
                  rx="6"
                  fill="#1e1b4b"
                  stroke="#e0e7ff"
                  strokeWidth="2.2"
                />

                {/* Eye Screen / Visor */}
                <rect x="15" y="14" width="18" height="7.5" rx="3.75" fill="#0f172a" />

                {/* Cute Glowing Cyan Eyes with Reflection */}
                <circle cx="19" cy="17.7" r="2.2" fill="#38bdf8" />
                <circle cx="19.7" cy="17" r="0.7" fill="#ffffff" />
                <circle cx="29" cy="17.7" r="2.2" fill="#38bdf8" />
                <circle cx="29.7" cy="17" r="0.7" fill="#ffffff" />

                {/* Cute Curved Smile */}
                <path
                  d="M20.5 24C22 25.4 26 25.4 27.5 24"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </button>
        </div>
      )}

      {/* Slide-Over Kuddus AI Copilot */}
      <KuddusCopilot isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}
