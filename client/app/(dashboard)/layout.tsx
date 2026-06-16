"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../components/ui/Logo";

// All the sidebar navigation links
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/assets", label: "Assets", icon: "📦" },
  { href: "/staff", label: "Staff", icon: "👥" },
  { href: "/departments", label: "Departments", icon: "🏢" },
  { href: "/audit-logs", label: "Audit Logs", icon: "📋" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Controls whether the mobile sidebar is open
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A] flex">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 flex flex-col
        bg-[#1E293B] border-r border-white/5
        transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        {/* Logo area */}
        <div className="h-16 flex items-center px-5 border-b border-white/5 flex-shrink-0">
          <Logo size="sm" />
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
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
                <span className="text-base">{item.icon}</span>
                {item.label}
                {/* Active indicator dot */}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom of sidebar */}
        <div className="p-3 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                          hover:bg-white/5 cursor-pointer transition-colors">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border 
                            border-indigo-500/30 flex items-center justify-center
                            text-xs font-bold text-indigo-300">
              JM
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-200 truncate">
                Jane Mwangi
              </div>
              <div className="text-xs text-slate-500 truncate">Asset Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay — closes sidebar when clicking outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6
                           border-b border-white/5 bg-[#0F172A]/80 
                           backdrop-blur-md sticky top-0 z-30 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-400 
                       hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            ☰
          </button>

          {/* Page title — reads from URL */}
          <div className="hidden lg:block">
            <h1 className="text-sm font-semibold text-slate-200 capitalize">
              {pathname.replace("/", "") || "Dashboard"}
            </h1>
          </div>

          {/* Right side of topbar */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification bell */}
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200
                               hover:bg-white/5 transition-colors relative">
              🔔
              {/* Red dot for unread notifications */}
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 
                               rounded-full bg-red-400" />
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border 
                            border-indigo-500/30 flex items-center justify-center
                            text-xs font-bold text-indigo-300 cursor-pointer">
              JM
            </div>
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