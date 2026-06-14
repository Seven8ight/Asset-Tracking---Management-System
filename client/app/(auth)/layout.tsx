import Logo from "../components/ui/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[var(--bg-base)]">

      {/* Left decorative panel — hidden on mobile, shows on lg screens */}
      <div className="hidden lg:flex flex-col w-[420px] flex-shrink-0
                      border-r border-white/7 bg-slate-900/50 p-12
                      relative overflow-hidden">
        {/* Subtle grid background */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6366F1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Content sits above the grid */}
        <div className="relative z-10 flex flex-col h-full">
          <Logo size="md" />

          <div className="mt-auto">
            <div className="w-8 h-0.5 bg-indigo-500 mb-5" />
            <p className="text-slate-300 text-lg leading-relaxed italic">
              "A centralized, real-time view of every asset — from lab equipment 
              to maintenance tools — across every department."
            </p>
            <p className="mt-4 text-sm text-slate-500 font-medium">
              Strathmore University · Facilities & Maintenance
            </p>
          </div>

          {/* Stats at the bottom */}
          <div className="flex gap-8 mt-12">
            {[
              { value: "500+", label: "Assets tracked" },
              { value: "12", label: "Departments" },
              { value: "99.9%", label: "Uptime" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-xl font-bold text-indigo-400">{s.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — the actual form */}
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>

    </div>
  );
}