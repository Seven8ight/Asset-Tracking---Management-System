"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../components/ui/Logo";

// Define what each role can see in the sidebar
const NAV_BY_ROLE = {
  asset_manager: [
    { href: "/dashboard", label: "Dashboard", icon: "⊞" },
    { href: "/departments", label: "Departments", icon: "🏢" },
    { href: "/staff", label: "Staff", icon: "👥" },
    { href: "/assets", label: "Assets", icon: "📦" },
    { href: "/roles", label: "Roles & Permissions", icon: "🔐" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ],
  support_staff: [
    { href: "/dashboard", label: "Dashboard", icon: "⊞" },
    { href: "/assets", label: "Assets", icon: "📦" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ],
  maintenance: [
    { href: "/dashboard", label: "Dashboard", icon: "⊞" },
    { href: "/assets", label: "Assets", icon: "📦" },
    { href: "/maintenance", label: "Maintenance", icon: "🔧" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ],
  saas_admin: [
    { href: "/dashboard", label: "Dashboard", icon: "⊞" },
    { href: "/departments", label: "Departments", icon: "🏢" },
    { href: "/staff", label: "Staff", icon: "👥" },
    { href: "/assets", label: "Assets", icon: "📦" },
    { href: "/roles", label: "Roles & Permissions", icon: "🔐" },
    { href: "/audit-logs", label: "Audit Logs", icon: "📋" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ],
};

// TODO: replace this with real user data from your auth context/API
const MOCK_USER = {
  name: "Jane Mwangi",
  email: "j.mwangi@strathmore.edu",
  role: "asset_manager" as keyof typeof NAV_BY_ROLE,
  department: "Facilities",
  initials: "JM",
};

const ROLE_LABELS: Record<string, string> = {
  asset_manager: "Asset Manager",
  support_staff: "Support Staff",
  maintenance: "Maintenance Engineer",
  saas_admin: "SaaS Admin",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get nav items based on the current user's role
  const navItems = NAV_BY_ROLE[MOCK_USER.role];

  const handleSignOut = () => {
    // TODO: clear auth token/session
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-[#1E293B] border-r border-white/5
        transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `}>

        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/5 flex-shrink-0">
          <Logo size="sm" />
        </div>

        {/* Department badge */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/15">
            <p className="text-xs text-slate-500 mb-0.5">Department</p>
            <p className="text-sm font-medium text-indigo-300 truncate">
              {MOCK_USER.department}
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  font-medium transition-colors group
                  ${active
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }
                `}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile at bottom */}
        <div className="p-3 border-t border-white/5 flex-shrink-0">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border
                            border-indigo-500/30 flex items-center justify-center
                            text-xs font-bold text-indigo-300 flex-shrink-0">
              {MOCK_USER.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {MOCK_USER.name}
              </p>
              <p className="text-xs text-slate-500">
                {ROLE_LABELS[MOCK_USER.role]}
              </p>
            </div>
          </div>

          {/* Sign out button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                       text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5
                       transition-colors"
          >
            <span>→</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-16 flex items-center gap-4 px-6
                           border-b border-white/5 bg-[#0F172A]/80
                           backdrop-blur-md sticky top-0 z-30 flex-shrink-0">

          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-400
                       hover:text-slate-200 hover:bg-white/5 transition-colors">
            ☰
          </button>

          {/* Current page name */}
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-200 capitalize">
              {pathname.replace("/", "").replace("-", " ") || "Dashboard"}
            </p>
            <p className="text-xs text-slate-500 hidden sm:block">
              {MOCK_USER.department} · {ROLE_LABELS[MOCK_USER.role]}
            </p>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-400
                             hover:text-slate-200 hover:bg-white/5 transition-colors">
            🔔
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5
                             rounded-full bg-red-400" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border
                          border-indigo-500/30 flex items-center justify-center
                          text-xs font-bold text-indigo-300 cursor-pointer">
            {MOCK_USER.initials}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}