"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../components/ui/Logo";
import { useAuth } from "../context/AuthContext";

// Each role sees different nav items
const NAV_BY_ROLE: Record<string, { href: string; label: string; icon: string }[]> = {
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

const ROLE_LABELS: Record<string, string> = {
  asset_manager: "Asset Manager",
  support_staff: "Support Staff",
  maintenance: "Maintenance Engineer",
  saas_admin: "SaaS Admin",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut, initials } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show nothing while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    );
  }

  // Default to asset_manager nav if role not recognised
  const userRole = "asset_manager";
  const navItems = NAV_BY_ROLE[userRole] ?? NAV_BY_ROLE.asset_manager;

  // Get department name from user
  const deptLabel = user.department_id ? "Your Department" : "No department";

  return (
    <div className="min-h-screen bg-[#0F172A] flex">

      {/* Sidebar */}
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
            <p className="text-sm font-medium text-indigo-300 truncate">{deptLabel}</p>
          </div>
        </div>

        {/* Nav */}
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
                  font-medium transition-colors
                  ${active
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }
                `}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User at bottom */}
        <div className="p-3 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border
                            border-indigo-500/30 flex items-center justify-center
                            text-xs font-bold text-indigo-300 flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {/* Real name from JWT */}
              <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500">
                {ROLE_LABELS[userRole] ?? "Asset Manager"}
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                       text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5
                       transition-colors">
            <span>→</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-16 flex items-center gap-4 px-6
                           border-b border-white/5 bg-[#0F172A]/80
                           backdrop-blur-md sticky top-0 z-30 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-400
                       hover:text-slate-200 hover:bg-white/5 transition-colors">
            ☰
          </button>

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-200 capitalize">
              {pathname.replace("/", "").replace("-", " ") || "Dashboard"}
            </p>
            {/* Real user name and role */}
            <p className="text-xs text-slate-500 hidden sm:block">
              {user.name} · {ROLE_LABELS[userRole] ?? "Asset Manager"}
            </p>
          </div>

          <button className="relative p-2 rounded-lg text-slate-400
                             hover:text-slate-200 hover:bg-white/5 transition-colors">
            🔔
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5
                             rounded-full bg-red-400" />
          </button>

          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border
                          border-indigo-500/30 flex items-center justify-center
                          text-xs font-bold text-indigo-300">
            {initials}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}