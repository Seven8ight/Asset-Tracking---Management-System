// This is a server component — no "use client" needed
// It shows different content based on role

export default function DashboardPage() {
  // TODO: get real user from session
  const user = {
    name: "Jane Mwangi",
    role: "asset_manager",
    department: "Facilities",
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          Good morning, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {user.department} department · Here&apos;s what needs your attention.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label}
            className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {s.label}
              </p>
              <span className="text-xl">{s.icon}</span>
            </div>
            <p className="text-3xl font-bold text-slate-100 mb-1">{s.value}</p>
            <p className={`text-xs font-medium
              ${s.change.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>
              {s.change} this month
            </p>
          </div>
        ))}
      </div>

      {/* Bottom two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent activity */}
        <div className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">
              Recent Activity
            </h2>
            <button className="text-xs text-indigo-400 hover:text-indigo-300">
              View all
            </button>
          </div>
          <div className="flex flex-col">
            {ACTIVITY.map((a, i) => (
              <div key={i}
                className="flex items-start gap-3 py-3 border-b border-white/5
                           last:border-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center
                                justify-center text-sm flex-shrink-0 mt-0.5">
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 leading-snug">{a.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asset status */}
        <div className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">
            Asset Status Overview
          </h2>
          <div className="flex flex-col gap-4">
            {ASSET_STATUS.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full"
                      style={{ background: s.color }} />
                    <span className="text-slate-400">{s.label}</span>
                  </div>
                  <span className="text-slate-300 font-medium">{s.count} assets</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.percent}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Quick Actions
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((a) => (
                <button key={a}
                  className="px-3 py-1.5 rounded-lg border border-white/5 text-xs
                             text-slate-400 hover:text-slate-200 hover:bg-white/5
                             transition-colors">
                  {a}
                </button>
              ))}
            </div>
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
  { label: "Staff Members", value: "31", icon: "👥", change: "+4" },
];

const ACTIVITY = [
  { icon: "📦", action: "Laptop #042 marked as In Use by John K.", time: "2 min ago" },
  { icon: "🔧", action: "Projector #017 flagged for repair by Mary W.", time: "18 min ago" },
  { icon: "✅", action: "Drill #008 returned and marked Available.", time: "1 hour ago" },
  { icon: "👥", action: "Alice M. added to Facilities department.", time: "3 hours ago" },
];

const ASSET_STATUS = [
  { label: "Available", count: "41", percent: 65, color: "#34D399" },
  { label: "In Use", count: "183", percent: 82, color: "#6366F1" },
  { label: "Under Repair", count: "24", percent: 30, color: "#F59E0B" },
  { label: "Broken", count: "12", percent: 15, color: "#F87171" },
];

const QUICK_ACTIONS = [
  "+ Add asset", "Invite staff", "View repairs", "Export report"
];