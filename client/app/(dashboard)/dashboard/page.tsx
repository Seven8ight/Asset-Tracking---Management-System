export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Welcome back, Jane. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label}
            className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase 
                               tracking-wider">{s.label}</span>
              <span className="text-xl">{s.icon}</span>
            </div>
            <div className="text-3xl font-bold text-slate-100">{s.value}</div>
            <div className={`text-xs mt-1 font-medium ${
              s.change.startsWith("+") ? "text-emerald-400" : "text-red-400"
            }`}>
              {s.change} this month
            </div>
          </div>
        ))}
      </div>

      {/* Two column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent activity */}
        <div className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">
            Recent Activity
          </h2>
          <div className="flex flex-col gap-3">
            {ACTIVITY.map((a, i) => (
              <div key={i}
                className="flex items-start gap-3 pb-3 border-b 
                           border-white/5 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-slate-700/50 flex 
                                items-center justify-center text-sm flex-shrink-0">
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300">{a.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asset status breakdown */}
        <div className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">
            Asset Status
          </h2>
          <div className="flex flex-col gap-3">
            {ASSET_STATUS.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{s.label}</span>
                  <span className="text-slate-300 font-medium">{s.count}</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${s.percent}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const STATS = [
  { label: "Total Assets", value: "248", icon: "📦", change: "+12" },
  { label: "In Use", value: "183", icon: "✅", change: "+8" },
  { label: "Under Repair", value: "24", icon: "🔧", change: "-3" },
  { label: "Departments", value: "12", icon: "🏢", change: "+1" },
];

const ACTIVITY = [
  { icon: "📦", action: "Laptop #042 marked as In Use by John K.", time: "2 minutes ago" },
  { icon: "🔧", action: "Projector #017 flagged for repair by Mary W.", time: "18 minutes ago" },
  { icon: "✅", action: "Drill #008 returned and marked Available.", time: "1 hour ago" },
  { icon: "👥", action: "Alice M. added to Facilities department.", time: "3 hours ago" },
  { icon: "🏢", action: "New department 'IT Lab' created.", time: "Yesterday" },
];

const ASSET_STATUS = [
  { label: "Available", count: "41", percent: 65, color: "#34D399" },
  { label: "In Use", count: "183", percent: 82, color: "#6366F1" },
  { label: "Under Repair", count: "24", percent: 30, color: "#F59E0B" },
  { label: "Broken", count: "12", percent: 15, color: "#F87171" },
];