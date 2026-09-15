"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"copilot" | "face" | "attendance">("copilot");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoPrompt, setDemoPrompt] = useState<string>(
    "Hey Kuddus, check me in for today and start my shift"
  );
  const [demoResponse, setDemoResponse] = useState({
    action: "attendance.checkin",
    status: "Success",
    message: "Good morning, Rahim! You are checked in at 09:12 AM from Engineering HQ. Have a productive day!",
    confidence: "99.4%",
    model: "Groq Whisper + Gemini 2.5 Flash",
  });
  const [isSimulating, setIsSimulating] = useState(false);

  const samplePrompts = [
    {
      prompt: "Hey Kuddus, check me in for today and start my shift",
      action: "attendance.checkin",
      status: "Success",
      message: "Good morning, Rahim! You are checked in at 09:12 AM from Engineering HQ. Have a productive day!",
      confidence: "99.4%",
      model: "Groq Whisper + Gemini 2.5 Flash",
    },
    {
      prompt: "I need to take next Monday off for a personal family event",
      action: "leave.apply",
      status: "Submitted (Pending Review)",
      message: "Leave application created for Monday (1 day). Manager Kuddus has been notified for approval.",
      confidence: "98.7%",
      model: "Gemini 2.5 Flash",
    },
    {
      prompt: "Can I work from home this Thursday? Heavy rainfall expected",
      action: "wfh.request",
      status: "Approved Auto-Policy",
      message: "WFH request for Thursday approved! Department remote quota is at 20% (limit: 50%).",
      confidence: "99.1%",
      model: "Groq LLaMA 3.3 70B",
    },
    {
      prompt: "How many paid annual leave days do I have remaining?",
      action: "leave.balance_query",
      status: "Query Answered",
      message: "You have 14 remaining Annual Leave days and 6 Sick Leave days available this year.",
      confidence: "100%",
      model: "Grounded Rule Engine",
    },
  ];

  const handleSelectPrompt = (p: typeof samplePrompts[0]) => {
    setIsSimulating(true);
    setDemoPrompt(p.prompt);
    setTimeout(() => {
      setDemoResponse(p);
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#fafbfe] text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Subtle architectural background grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient soft glow overlays (Pure light-mode aesthetics, zero dark sludge) */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-indigo-100/60 via-purple-50/40 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-blue-100/40 blur-3xl pointer-events-none rounded-full" />

      {/* ---------------------------------------------------------
          1. FLOATING GLASS ISLAND NAVBAR
      --------------------------------------------------------- */}
      <header className="sticky top-5 z-50 w-full px-4 sm:px-6">
        <nav className="mx-auto max-w-6xl w-full backdrop-blur-xl bg-white/85 border border-slate-200/80 shadow-xs rounded-full px-5 py-3 flex justify-between items-center transition-all duration-300">
          {/* Brand Logo & Pill */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="text-base tracking-tight">K</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                Kuddus<span className="text-indigo-600">HRM</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                Agentic v2.0
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#overview" className="hover:text-indigo-600 transition-colors">Overview</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#copilot-demo" className="hover:text-indigo-600 transition-colors">Voice AI</a>
            <a href="#biometrics" className="hover:text-indigo-600 transition-colors">Biometrics</a>
            <a href="#architecture" className="hover:text-indigo-600 transition-colors">Enterprise</a>
          </div>

          {/* Right Action Island */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-slate-100/80 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-all duration-200 active:scale-[0.98]"
            >
              <span>Dashboard</span>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200">
                →
              </span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 mx-auto max-w-6xl w-full bg-white border border-slate-200 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
            <a href="#overview" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 py-1">Overview</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 py-1">Features</a>
            <a href="#copilot-demo" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 py-1">Voice AI</a>
            <a href="#biometrics" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 py-1">Biometrics</a>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link href="/login" className="text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl">
                Sign In
              </Link>
              <Link href="/dashboard" className="text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl">
                Open Dashboard
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ---------------------------------------------------------
          2. HERO SECTION
      --------------------------------------------------------- */}
      <main id="overview" className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100 shadow-xs mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-indigo-900 uppercase">
            Autonomous Workforce Operating System
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 max-w-4xl leading-[1.12]">
          Intelligent HR for teams that{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
            move at lightspeed.
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
          Offline face biometric verification, conversational voice intelligence, and autonomous leave approvals powered by Gemini 2.5 and Neon Serverless.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all duration-200 flex items-center justify-center gap-2.5 group active:scale-[0.98]"
          >
            <span>Launch Web Dashboard</span>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
          <a
            href="#copilot-demo"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all duration-200 flex items-center justify-center shadow-2xs"
          >
            Try Voice AI Demo ↓
          </a>
        </div>

        {/* Key Operational Proof Metrics */}
        <div className="mt-16 pt-10 border-t border-slate-200/70 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">&lt; 150ms</p>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Voice Reasoner TTFT</p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">100%</p>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Offline Biometrics</p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">256-Bit</p>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">AES-GCM Encryption</p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">99.9%</p>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Neon DB Uptime</p>
          </div>
        </div>

        {/* ---------------------------------------------------------
            3. DOUBLE-BEZEL INTERACTIVE PLATFORM PREVIEW
        --------------------------------------------------------- */}
        <div className="mt-14 w-full max-w-5xl">
          {/* Outer Shell */}
          <div className="p-2 sm:p-3 bg-slate-200/50 rounded-[2.2rem] sm:rounded-[2.8rem] border border-slate-200 shadow-xl shadow-indigo-900/5">
            {/* Inner Core */}
            <div className="bg-white rounded-[1.8rem] sm:rounded-[2.4rem] border border-slate-100 overflow-hidden text-left shadow-2xs">
              {/* Mock Window Header */}
              <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-xs font-mono font-medium text-slate-400">
                    kuddus-hrm-app.live
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex items-center bg-slate-200/60 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab("copilot")}
                    className={`px-3.5 py-1.5 rounded-lg transition-all ${
                      activeTab === "copilot"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Voice Copilot
                  </button>
                  <button
                    onClick={() => setActiveTab("face")}
                    className={`px-3.5 py-1.5 rounded-lg transition-all ${
                      activeTab === "face"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Face Biometrics
                  </button>
                  <button
                    onClick={() => setActiveTab("attendance")}
                    className={`px-3.5 py-1.5 rounded-lg transition-all ${
                      activeTab === "attendance"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Attendance Feed
                  </button>
                </div>
              </div>

              {/* Mock View Body */}
              <div className="p-6 sm:p-10 min-h-[380px] flex flex-col justify-center">
                {activeTab === "copilot" && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-7 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-indigo-700">
                        <span>🎙️ Dual-Engine Voice Reasoner</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Speak naturally. Kuddus does the rest.
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Say &ldquo;Check me in for today&rdquo; or &ldquo;Can I work from home Friday?&rdquo; Groq Whisper transcribes in ~100ms, and Gemini 2.5 resolves intent, slots, and business rules without requiring form inputs.
                      </p>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                          <span>AGENT STATE</span>
                          <span className="text-emerald-600 font-semibold">ONLINE • 12ms</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">
                          &ldquo;Good morning Mahfuz! Your attendance punch has been recorded at 09:14 AM. Your next scheduled meeting is at 11:30 AM.&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-5 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-50/50 to-white rounded-2xl border border-indigo-100 text-center">
                      <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 animate-pulse">
                        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                      </div>
                      <span className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Listening (Groq Whisper)
                      </span>
                      <div className="mt-3 flex items-center gap-1">
                        <span className="w-1.5 h-6 bg-indigo-500 rounded-full animate-bounce" />
                        <span className="w-1.5 h-10 bg-indigo-600 rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-4 bg-indigo-400 rounded-full animate-bounce delay-200" />
                        <span className="w-1.5 h-8 bg-indigo-500 rounded-full animate-bounce delay-300" />
                        <span className="w-1.5 h-5 bg-indigo-600 rounded-full animate-bounce delay-150" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "face" && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-7 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-emerald-700">
                        <span>🛡️ Anti-Spoofing Liveness Detection</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Instant, spoof-proof facial punches.
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        MobileFaceNet runs on Android and iOS devices to detect live facial cues (smile, blink, head turn) and computes 128-dimensional vector embeddings locally.
                      </p>
                      <ul className="space-y-2 text-xs font-medium text-slate-600">
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> No raw camera photos ever sent over the network
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Zero server GPU load — embeddings calculated on device
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Vectors encrypted with AES-256 GCM in transit
                        </li>
                      </ul>
                    </div>

                    <div className="md:col-span-5 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
                      <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-emerald-500/80 flex items-center justify-center bg-white p-2 relative shadow-xs">
                        <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-black text-indigo-700">
                          RC
                        </div>
                        <span className="absolute -bottom-2.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
                          99.8% Match
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-bold text-slate-900">Rahim Chowdhury</p>
                      <p className="text-xs text-slate-500">Senior Software Engineer • Engineering</p>
                    </div>
                  </div>
                )}

                {activeTab === "attendance" && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">Live Enterprise Roster</h4>
                        <p className="text-xs text-slate-500">Real-time Neon PostgreSQL synchronized feed</p>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        34 Active Today
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Mahfuz Admin</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Present</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Checked in 08:45 AM • Office</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Karim Hasan</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">WFH Approved</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Online 09:00 AM • Remote</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Fatima Begum</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Present</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Checked in 09:12 AM • Mobile</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ---------------------------------------------------------
          4. ASYMMETRIC BENTO GRID (FEATURES)
      --------------------------------------------------------- */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-4">
            ARCHITECTURE & CAPABILITIES
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
            Engineered for precision and autonomy.
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            Every module in Kuddus HRM is designed to eliminate bureaucratic paperwork and keep operations frictionless.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Voice Reasoner (Col Span 7) */}
          <div className="md:col-span-7 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl mb-6 border border-indigo-100">
                🎙️
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
                Kuddus Voice Copilot
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
                Integrated Groq Whisper Large v3 paired with Google Gemini 2.5 Flash and Groq LLaMA 3.3. Employees speak in plain English or Bengali to submit punches, check holiday balances, and inquire about policies with zero manual form-filling.
              </p>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs font-mono text-slate-600">
              <span>Automatic API key rotation & failover</span>
              <span className="text-indigo-600 font-bold">200ms Latency</span>
            </div>
          </div>

          {/* Card 2: Offline Biometrics (Col Span 5) */}
          <div className="md:col-span-5 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl mb-6 border border-emerald-100">
                👁️
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
                Offline Face Liveness
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                MobileFaceNet model extracts vector embeddings locally on mobile devices. Random liveness challenges prevent photo/video spoofing even in offline field conditions.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Anti-Spoofing Certified</span>
            </div>
          </div>

          {/* Card 3: Remote & WFH (Col Span 4) */}
          <div className="md:col-span-4 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xl mb-6 border border-violet-100">
              🏡
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
              Work From Home Policies
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Automated quota verification, multi-day request approvals, reason auditing, and instant manager notification feeds.
            </p>
          </div>

          {/* Card 4: Neon PostgreSQL (Col Span 4) */}
          <div className="md:col-span-4 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xl mb-6 border border-sky-100">
              🐘
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
              Neon Cloud PostgreSQL
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              High-concurrency serverless database with automatic schema migrations, SSL encryption, and instant zero-downtime scaling.
            </p>
          </div>

          {/* Card 5: Enterprise Security (Col Span 4) */}
          <div className="md:col-span-4 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl mb-6 border border-amber-100">
              🔐
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
              Role-Based Governance
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Fine-grained JWT authentication, rate-limiting protections, and immutable biometric audit trails ensure zero unauthorized access.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          5. LIVE INTERACTIVE VOICE AI PLAYGROUND
      --------------------------------------------------------- */}
      <section id="copilot-demo" className="py-20 bg-slate-100/60 border-y border-slate-200/70">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold mb-3">
              LIVE SIMULATION
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Test Kuddus Copilot Yourself
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Click a real employee utterance below to see how our dual-model reasoning pipeline extracts intents and executes transactions.
            </p>
          </div>

          {/* Interactive Simulator Card */}
          <div className="p-3 bg-white/80 rounded-3xl border border-slate-200 shadow-lg">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 space-y-6">
              {/* Preset Query Chips */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Select a voice command to simulate:
                </label>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPrompt(p)}
                      className={`text-xs text-left px-3.5 py-2 rounded-xl transition-all font-medium border ${
                        demoPrompt === p.prompt
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer"
                      }`}
                    >
                      &ldquo;{p.prompt}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation Output Area */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-slate-500">EXTRACTED INTENT: <strong className="text-indigo-700">{demoResponse.action}</strong></span>
                  <span className="text-slate-500">MODEL: <strong className="text-slate-800">{demoResponse.model}</strong></span>
                  <span className="text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">{demoResponse.status}</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-800 text-sm font-medium leading-relaxed">
                  {isSimulating ? (
                    <div className="flex items-center gap-2 text-indigo-600 animate-pulse">
                      <span>Reasoning with Gemini 2.5 Flash...</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🤖</span>
                      <div>
                        <p className="font-semibold text-slate-900">{demoResponse.message}</p>
                        <p className="text-xs text-slate-400 mt-1">Confidence Score: {demoResponse.confidence} • Latency: 114ms</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          6. ENTERPRISE GUARANTEES & BIOMETRICS DEEP-DIVE
      --------------------------------------------------------- */}
      <section id="biometrics" className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/60">
              PRIVACY-FIRST BIOMETRICS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Biometrics that protect employee privacy by design.
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Unlike legacy biometric clocks that store photographs on centralized servers, Kuddus HRM operates strictly on mathematical feature vectors. Images stay in device memory and are destroyed immediately after mathematical embedding.
            </p>
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  01
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Zero Raw Photos Stored</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Only irreversibly encrypted 128-float coordinate arrays are retained in Neon PostgreSQL.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  02
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Dynamic Anti-Spoof Challenges</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Random sequences (turn left, turn right, smile, blink) defeat printed photo and screen playback attacks.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 p-8 bg-gradient-to-tr from-slate-100 to-indigo-50/40 rounded-3xl border border-slate-200 flex flex-col justify-center items-center text-center">
            <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-mono font-bold text-slate-500">CIPHER PROTOCOL</span>
                <span className="text-xs font-mono text-emerald-600 font-bold">AES_256_GCM</span>
              </div>
              <div className="font-mono text-left text-[11px] bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto">
                <code>
                  {`// Client Embedding Vector\n`}
                  {`vector: [0.142, -0.891, 0.412, ...]\n`}
                  {`nonce: 12-byte cryptographic random\n`}
                  {`auth_tag: 16-byte integrity tag\n`}
                  {`status: ENCRYPTED_AND_MATCHED`}
                </code>
              </div>
              <p className="text-xs text-slate-500">
                Even in the event of a full database leak, vectors cannot be converted back into facial pictures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          7. CALL TO ACTION BANNER
      --------------------------------------------------------- */}
      <section id="architecture" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="p-8 sm:p-14 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-[2.5rem] shadow-xl text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to automate your workforce operations?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Experience the power of offline face recognition and AI-driven conversational HR today. Open your executive dashboard or sign in to get started.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-indigo-950 font-bold text-sm hover:bg-slate-100 shadow-md transition-all group flex items-center justify-center gap-2"
              >
                <span>Access Live Dashboard</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-colors"
              >
                Sign In With Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          8. CLEAN ARCHITECTURAL FOOTER
      --------------------------------------------------------- */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">
              K
            </div>
            <span className="font-semibold text-slate-800">Kuddus HRM Platform</span>
            <span>•</span>
            <span>Version 2.0.0</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/login" className="hover:text-slate-900 transition-colors">Employee Login</Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
            <a href="https://neon.tech" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">Neon Cloud DB</a>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700">All Cloud Services Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

