"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../_lib/ui/Logo";
import { useAuth } from "../_lib/context/AuthContext";
import { departmentApi } from "@/lib/api";
import SocketProvider from "../_lib/context/SocketContext";
import AdminContext, { useAdminDepartment } from "../_lib/context/AdminContext";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  requiredPermission?: string | string[];
};

type DepartmentOption = {
  id: string;
  name: string;
  color: string;
};

const ROLE_PRIORITY = [
  "SaaS Admin",
  "Department Manager",
  "Asset Manager",
  "Maintenance Engineer",
  "Support Staff",
];

function getPrimaryRole(roles: string[]): string {
  if (roles.length === 0) return "Member";
  const ranked = [...roles].sort((a, b) => {
    const rankA = ROLE_PRIORITY.indexOf(a);
    const rankB = ROLE_PRIORITY.indexOf(b);
    const safeRankA = rankA === -1 ? ROLE_PRIORITY.length : rankA;
    const safeRankB = rankB === -1 ? ROLE_PRIORITY.length : rankB;
    return safeRankA - safeRankB;
  });
  return ranked[0];
}

const DASHBOARD_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  {
    href: "/departments",
    label: "Department",
    icon: "🏢",
    requiredPermission: "View all departments",
  },
  {
    href: "/staff",
    label: "Staff",
    icon: "👥",
    requiredPermission: "View all department users",
  },
  { href: "/assets", label: "Assets", icon: "📦" },
  {
    href: "/roles",
    label: "Roles & Permissions",
    icon: "🔐",
    requiredPermission: "Manage user roles",
  },
  {
    href: "/audit-logs",
    label: "Audit Logs",
    icon: "📋",
    requiredPermission: ["View departmental logs", "View all logs", "View log"],
  },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminContext>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AdminContext>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut, initials, roles, hasPermission } = useAuth();
  const { viewingDepartmentId, setViewingDepartmentId } = useAdminDepartment();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState("");

  // SaaS Admin-only: department switcher
  const isSaasAdmin = roles.includes("SaaS Admin");
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [allDepartments, setAllDepartments] = useState<DepartmentOption[]>([]);
  const [switcherLoading, setSwitcherLoading] = useState(false);
  const [switcherError, setSwitcherError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load department name for the current target (own or switched)
  useEffect(() => {
    let mounted = true;
    const targetDepartmentId = viewingDepartmentId || user?.department_id;

    const loadDepartment = async () => {
      if (!targetDepartmentId) {
        if (mounted) setDepartmentName("");
        return;
      }
      try {
        const response = await departmentApi.getOne(targetDepartmentId);
        const department = response?.response?.message;
        if (mounted) {
          setDepartmentName(department?.name ?? "Your Department");
        }
      } catch {
        if (mounted) setDepartmentName("Your Department");
      }
    };

    loadDepartment();
    return () => {
      mounted = false;
    };
  }, [user?.department_id, viewingDepartmentId]);

  const navItems = useMemo(
    () =>
      DASHBOARD_NAV.filter((item) => {
        if (!item.requiredPermission) return true;
        return hasPermission(item.requiredPermission);
      }),
    [hasPermission, roles],
  );

  useEffect(() => {
    if (loading || !user) return;
    const allowedPaths = new Set(navItems.map((item) => item.href));
    if (allowedPaths.has(pathname)) return;
    const fallbackRoute = navItems[0]?.href ?? "/dashboard";
    if (pathname !== fallbackRoute) router.replace(fallbackRoute);
  }, [loading, user, pathname, navItems, router]);

  const openSwitcher = async () => {
    if (!isSaasAdmin) return;
    setShowSwitcher(true);
    setSwitcherLoading(true);
    setSwitcherError("");
    try {
      const data = await departmentApi.getAll();
      const all = data?.response?.message;
      setAllDepartments(Array.isArray(all) ? all : []);
    } catch (err) {
      setSwitcherError((err as Error).message || "Failed to load departments");
    } finally {
      setSwitcherLoading(false);
    }
  };

  const selectDepartment = (id: string | null) => {
    if (!isSaasAdmin) return;
    setViewingDepartmentId(id);
    setShowSwitcher(false);
  };

  // Show nothing while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Compute whether we are viewing the user's own department
  const userDeptId = user.department_id || null;
  const targetDepartmentId = viewingDepartmentId || userDeptId;
  const isViewingMyDepartment =
    !!userDeptId &&
    (viewingDepartmentId === null ||
      viewingDepartmentId === undefined ||
      viewingDepartmentId === userDeptId);

  // Badge labels
  const deptLabel = targetDepartmentId
    ? departmentName || "Loading department..."
    : "No department";

  const primaryRole = getPrimaryRole(roles);
  const roleLabel = roles.length > 1 ? `${roles.length} roles` : primaryRole;

  return (
    <SocketProvider>
      <div className="min-h-screen bg-[#0F172A] flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 flex flex-col
            bg-[#1E293B] border-r border-white/5
            transform transition-transform duration-200
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:relative lg:translate-x-0
          `}
        >
          {/* Logo */}
          <div className="h-16 flex items-center px-5 border-b border-white/5 shrink-0">
            <Logo size="sm" />
          </div>

          {/* Department badge */}
          <div className="px-4 py-3 border-b border-white/5">
            <div className="px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/15">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-xs text-slate-500">
                  {isViewingMyDepartment ? "Department" : "Viewing department"}
                </p>
                {isSaasAdmin && (
                  <button
                    onClick={openSwitcher}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Switch
                  </button>
                )}
              </div>
              <p className="text-sm font-medium text-indigo-300 truncate">
                {deptLabel}
              </p>
              {isSaasAdmin && !isViewingMyDepartment && (
                <button
                  onClick={() => selectDepartment(null)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1"
                >
                  ← Back to my department
                </button>
              )}
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
                    ${
                      active
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

          {/* User at bottom */}
          <div className="p-3 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
              <div
                className="w-8 h-8 rounded-full bg-indigo-500/20 border
                            border-indigo-500/30 flex items-center justify-center
                            text-xs font-bold text-indigo-300 shrink-0"
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{roleLabel}</p>
              </div>
            </div>

            <button
              onClick={signOut}
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

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header
            className="h-16 flex items-center gap-4 px-6
                           border-b border-white/5 bg-[#0F172A]/80
                           backdrop-blur-md sticky top-0 z-30 shrink-0"
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400
                       hover:text-slate-200 hover:bg-white/5 transition-colors"
            >
              ☰
            </button>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-200 capitalize">
                {pathname.replace("/", "").replace("-", " ") || "Dashboard"}
              </p>
              <p className="text-xs text-slate-500 hidden sm:block">
                {user.name} · {roleLabel}
              </p>
            </div>

            <div
              className="w-8 h-8 rounded-full bg-indigo-500/20 border
                          border-indigo-500/30 flex items-center justify-center
                          text-xs font-bold text-indigo-300"
            >
              {initials}
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>

      {/* Department switcher modal — SaaS Admin only */}
      {isSaasAdmin && showSwitcher && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSwitcher(false)}
          />
          <div
            className="relative z-10 w-full max-w-md bg-[#1E293B]
                          rounded-xl border border-white/10 p-6 max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-semibold text-slate-100">
                Switch Department
              </h2>
              <button
                onClick={() => setShowSwitcher(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {switcherError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 mb-3 shrink-0">
                {switcherError}
              </div>
            )}

            <div className="flex flex-col gap-1.5 overflow-y-auto">
              <button
                onClick={() => selectDepartment(null)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors
                  ${
                    isViewingMyDepartment
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
              >
                My department
              </button>

              {switcherLoading && (
                <p className="text-sm text-slate-400 px-3 py-2.5">
                  Loading departments...
                </p>
              )}

              {!switcherLoading &&
                allDepartments.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => selectDepartment(d.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors
                      ${
                        viewingDepartmentId === d.id
                          ? "bg-indigo-500/15 text-indigo-300"
                          : "text-slate-300 hover:bg-white/5"
                      }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    {d.name}
                  </button>
                ))}

              {!switcherLoading &&
                allDepartments.length === 0 &&
                !switcherError && (
                  <p className="text-sm text-slate-400 px-3 py-2.5">
                    No departments found.
                  </p>
                )}
            </div>
          </div>
        </div>
      )}
    </SocketProvider>
  );
}
