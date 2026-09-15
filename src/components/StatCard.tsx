import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  icon: React.ReactNode;
  variant?: "indigo" | "emerald" | "amber" | "purple" | "blue";
}

export default function StatCard({
  title,
  value,
  subtitle,
  badgeText,
  icon,
  variant = "indigo",
}: StatCardProps) {
  const colorMap = {
    indigo: {
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    amber: {
      iconBg: "bg-amber-50 text-amber-600 border-amber-200",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    },
    purple: {
      iconBg: "bg-purple-50 text-purple-600 border-purple-200",
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    },
    blue: {
      iconBg: "bg-sky-50 text-sky-600 border-sky-200",
      badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
    },
  };

  const colors = colorMap[variant];

  return (
    <div className="corp-card p-6 bg-white border border-slate-200 rounded-2xl shadow-xs corp-card-hover">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colors.iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
        {badgeText && (
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${colors.badgeBg}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
    </div>
  );
}
