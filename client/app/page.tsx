import Link from "next/link";
import Logo from "./_lib/ui/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100">
      {/* ── Navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5
                         bg-[#0F172A]/80 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 
                         transition-colors rounded-md hover:bg-white/5"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold text-white rounded-md
                         bg-indigo-500 hover:bg-indigo-600 transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-40 pb-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-indigo-500/10 border border-indigo-500/20 mb-8"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-indigo-400 
                             animate-[pulse-dot_2s_ease_infinite]"
            />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Strathmore University · Facilities & Maintenance
            </span>
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight mb-6">
            Every asset,{" "}
            <span className="text-indigo-400">every department,</span> one
            platform.
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto mb-10">
            A unified system for tracking, managing, and maintaining
            Strathmore&apos;s physical assets — with real-time updates and full
            role-based access control.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-md bg-indigo-500 hover:bg-indigo-600
                         text-white font-semibold text-sm transition-colors
                         shadow-lg shadow-indigo-500/25"
            >
              Get started free →
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-md border border-white/10
                         text-slate-300 hover:border-white/20 hover:text-white
                         font-semibold text-sm transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-white/5 bg-white/2 py-6 px-6">
        <div className="max-w-4xl mx-auto flex justify-center gap-16 flex-wrap">
          {[
            { value: "50+", label: "Assets supported" },
            { value: "10+", label: "Departments supported" },
            { value: "4", label: "System roles" },
            { value: "100%", label: "Audit trail" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-indigo-400">
                {s.value}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section className="py-24 px-6" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold text-indigo-400 uppercase 
                          tracking-widest mb-3"
            >
              Features
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Built for how university facilities actually work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl bg-slate-900/60 border border-white/5
                           hover:border-indigo-500/20 transition-colors"
              >
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold text-indigo-400 uppercase 
                          tracking-widest mb-3"
            >
              Roles & Access
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              The right access for every person
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((r) => (
              <div
                key={r.name}
                className="p-5 rounded-xl bg-[#0F172A] border border-white/5"
                style={{ borderTop: `3px solid ${r.color}` }}
              >
                <h3 className="font-semibold text-slate-100 mb-3">{r.name}</h3>
                <ul className="flex flex-col gap-2">
                  {r.perms.map((p) => (
                    <li key={p} className="text-xs text-slate-400 flex gap-2">
                      <span style={{ color: r.color }}>·</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-xs relative top-20 mt-10 text-slate-500">
            4 system roles ship out of the box, plus unlimited custom roles with
            their own defined permissions.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center">
        <div
          className="max-w-lg mx-auto p-10 rounded-2xl bg-slate-900/60 
                        border border-white/5"
        >
          <Logo size="lg" />
          <h2 className="text-2xl font-bold mt-6 mb-3 tracking-tight">
            Ready to take control?
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            Join Strathmore&apos;s asset management system and bring clarity to
            every department.
          </p>
          <Link
            href="/signup"
            className="inline-flex px-6 py-3 rounded-md bg-indigo-500 
                       hover:bg-indigo-600 text-white font-semibold text-sm 
                       transition-colors"
          >
            Create your account →
          </Link>
          <p className="mt-4 text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div
          className="max-w-6xl mx-auto flex items-center justify-between 
                        flex-wrap gap-4"
        >
          <Logo size="sm" />
          <p className="text-xs text-slate-500">
            © 2026 AssetFlow · Strathmore University ICS Group D
          </p>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: "📊",
    title: "Role-based dashboards",
    desc: "Every user sees exactly what they need based on their role and department.",
  },
  {
    icon: "📦",
    title: "Real-time asset tracking",
    desc: "Live status updates on every asset pushed instantly to all connected users.",
  },
  {
    icon: "🏢",
    title: "Department management",
    desc: "Create departments, invite staff, assign custom roles and control access.",
  },
  {
    icon: "🔐",
    title: "Granular permissions",
    desc: "Define exactly what each role can read, write, or manage per department.",
  },
  {
    icon: "📋",
    title: "Full audit trail",
    desc: "Every action is logged with timestamps and the identity of who did it.",
  },
];

const ROLES = [
  {
    name: "Asset Manager",
    color: "#6366F1",
    perms: [
      "Create departments",
      "Invite staff",
      "Full asset CRUD",
      "Assign roles",
    ],
  },
  {
    name: "Maintenance Engineer",
    color: "#F59E0B",
    perms: [
      "Flag broken assets",
      "Log repairs",
      "Update status",
      "Audit assets",
    ],
  },
  {
    name: "Support Staff",
    color: "#34D399",
    perms: ["View assets", "Claim ownership", "Report damage", "Return assets"],
  },
  {
    name: "SaaS Admin",
    color: "#F87171",
    perms: [
      "Full system access",
      "All departments",
      "Audit logs",
      "User management",
    ],
  },
];
