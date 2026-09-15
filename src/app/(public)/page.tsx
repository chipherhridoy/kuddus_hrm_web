import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow delay-300"></div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 glass-panel border-b border-white/5 py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
            K
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Kuddus HRM
          </span>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</Link>
          <Link href="#about" className="text-sm text-white/60 hover:text-white transition-colors">Platform</Link>
          <Link 
            href="/login" 
            className="text-sm font-semibold px-5 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 text-center animate-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-purple-500/30 mb-8 animate-in delay-100">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-xs font-medium text-purple-300">v2.0 Agentic Platform Now Live</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter max-w-5xl leading-[1.1] animate-in delay-200">
          The future of <br />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            human resource
          </span> management.
        </h1>
        
        <p className="mt-8 text-lg md:text-xl text-white/50 max-w-2xl font-light animate-in delay-300">
          Automate attendance, streamline operations, and manage your workforce with our ultra-fast, AI-driven Neon PostgreSQL platform.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 animate-in delay-400">
          <Link 
            href="/login"
            className="px-8 py-4 rounded-full btn-primary text-white font-semibold text-lg flex items-center justify-center gap-2 group"
          >
            Access Dashboard
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
          <a 
            href="https://neon.tech" 
            target="_blank" 
            rel="noreferrer"
            className="px-8 py-4 rounded-full glass-panel font-semibold text-lg flex items-center justify-center hover-lift"
          >
            Powered by Neon
          </a>
        </div>
      </main>

      {/* Grid Features */}
      <section id="features" className="relative z-10 px-8 pb-32 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-in delay-500">
        <div className="glass-panel p-8 rounded-3xl hover-lift bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30 text-purple-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-white/90">Agentic Speed</h3>
          <p className="text-sm text-white/50 leading-relaxed">Experience zero-latency operations with edge-optimized routing and predictive AI data fetching.</p>
        </div>
        
        <div className="glass-panel p-8 rounded-3xl hover-lift bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30 text-emerald-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-white/90">Bank-Grade Security</h3>
          <p className="text-sm text-white/50 leading-relaxed">Built on top of robust Cloud PostgreSQL with encrypted data at rest and in transit.</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl hover-lift bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30 text-indigo-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-white/90">Unified Directory</h3>
          <p className="text-sm text-white/50 leading-relaxed">Manage attendance, leaves, and user roles from a beautifully crafted, centralized dashboard.</p>
        </div>
      </section>
    </div>
  );
}
