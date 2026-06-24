"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { assetApi } from "../../../lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await assetApi.getDepartmentAssets();
        setAssets(Array.isArray(data) ? data : []);
      } catch {
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  // Compute stats from real assets
  const total = assets.length;
  const inUse = assets.filter((a) => a.status === "In Use").length;
  const underRepair = assets.filter((a) => a.status === "Under Repair").length;
  const available = assets.filter((a) => a.status === "Available").length;
  const broken = assets.filter((a) => a.status === "Broken").length;

  const stats = [
    { label: "Total Assets", value: total, icon: "📦" },
    { label: "Available", value: available, icon: "✅" },
    { label: "In Use", value: inUse, icon: "🔄" },
    { label: "Under Repair", value: underRepair, icon: "🔧" },
  ];

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-6">

      {/* Greeting with real name */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          Good morning, {firstName} 👋
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Here&apos;s what&apos;s happening in your department today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label}
            className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {s.label}
              </p>
              <span className="text-xl">{s.icon}</span>
            </div>
            {loading ? (
              <div className="h-8 w-16 rounded bg-white/5 animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-slate-100">{s.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent assets */}
        <div className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">
            Recent Assets
          </h2>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No assets yet. Add your first asset from the Assets page.
            </div>
          ) : (
            <div className="flex flex-col">
              {assets.slice(0, 5).map((a: any) => (
                <div key={a.id}
                  className="flex items-center gap-3 py-2.5 border-b
                             border-white/5 last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center
                                  justify-center text-sm flex-shrink-0">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{a.name}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Asset status overview */}
        <div className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">
            Asset Status Overview
          </h2>
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 rounded bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : total === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No data yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {[
                { label: "Available", count: available, color: "#34D399" },
                { label: "In Use", count: inUse, color: "#6366F1" },
                { label: "Under Repair", count: underRepair, color: "#F59E0B" },
                { label: "Broken", count: broken, color: "#F87171" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full"
                        style={{ background: s.color }} />
                      <span className="text-slate-400">{s.label}</span>
                    </div>
                    <span className="text-slate-300 font-medium">
                      {s.count} assets
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: total > 0 ? `${(s.count / total) * 100}%` : "0%",
                        background: s.color,
                      }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Available": "bg-emerald-500/15 text-emerald-400",
    "In Use": "bg-indigo-500/15 text-indigo-400",
    "Under Repair": "bg-amber-500/15 text-amber-400",
    "Broken": "bg-red-500/15 text-red-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
      ${styles[status] ?? "bg-slate-500/15 text-slate-400"}`}>
      {status}
    </span>
  );
}