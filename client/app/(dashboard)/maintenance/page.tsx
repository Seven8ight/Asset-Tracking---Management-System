"use client";

import { useState, useEffect } from "react";
import { assetApi, assignmentApi } from "../../../lib/api";

interface Asset {
  id: string;
  name: string;
  description: string;
  status: string;
  quantity: number;
}

interface Assignment {
  id: string;
  asset_id: string;
  user_id: string;
  assigned_at: string;
  returned_at: string | null;
  asset?: Asset;
}

export default function MaintenancePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetsData, assignData] = await Promise.all([
        assetApi.getDepartmentAssets(),
        assignmentApi.getDepartmentAssignments(),
      ]);
      setAssets(Array.isArray(assetsData) ? assetsData : []);
      setAssignments(Array.isArray(assignData) ? assignData : []);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Assets that need attention
  const brokenAssets = assets.filter(
    (a) => a.status === "Broken" || a.status === "Under Repair"
  );

  const updateAssetStatus = async (assetId: string, newStatus: string) => {
    setUpdating(assetId);
    try {
      await assetApi.update(assetId, { status: newStatus });
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setUpdating(null);
    }
  };

  const STATUS_STYLES: Record<string, string> = {
    "Broken": "bg-red-500/15 text-red-400",
    "Under Repair": "bg-amber-500/15 text-amber-400",
    "Available": "bg-emerald-500/15 text-emerald-400",
    "In Use": "bg-indigo-500/15 text-indigo-400",
  };

  // Summary counts
  const broken = assets.filter((a) => a.status === "Broken").length;
  const underRepair = assets.filter((a) => a.status === "Under Repair").length;
  const activeAssignments = assignments.filter((a) => !a.returned_at).length;

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          Maintenance
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Track broken assets and manage repairs.
        </p>
      </div>

      {apiError && (
        <div className="p-3 rounded-md text-sm bg-red-500/10 border
                        border-red-500/20 text-red-300">
          {apiError}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Broken", value: broken, color: "#F87171" },
          { label: "Under Repair", value: underRepair, color: "#F59E0B" },
          { label: "Active assignments", value: activeAssignments, color: "#6366F1" },
        ].map((s) => (
          <div key={s.label}
            className="p-4 rounded-xl bg-[#1E293B] border border-white/5 text-center">
            {loading ? (
              <div className="h-8 rounded bg-white/5 animate-pulse mx-auto w-12" />
            ) : (
              <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>
                {s.value}
              </div>
            )}
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Assets needing attention */}
      <div>
        <h2 className="text-sm font-semibold text-slate-300 mb-3">
          Assets needing attention
        </h2>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-[#1E293B] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && brokenAssets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16
                          rounded-xl bg-[#1E293B] border border-dashed border-white/10">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm text-slate-400">
              All assets are in good condition.
            </p>
          </div>
        )}

        {!loading && brokenAssets.length > 0 && (
          <div className="flex flex-col gap-3">
            {brokenAssets.map((asset) => (
              <div key={asset.id}
                className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold text-slate-100">{asset.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${STATUS_STYLES[asset.status] ?? "bg-slate-500/15 text-slate-400"}`}>
                        {asset.status}
                      </span>
                    </div>
                    {asset.description && (
                      <p className="text-sm text-slate-400">{asset.description}</p>
                    )}
                  </div>

                  {/* Status update buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {asset.status === "Broken" && (
                      <button
                        disabled={updating === asset.id}
                        onClick={() => updateAssetStatus(asset.id, "Under Repair")}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300
                                   text-xs font-medium hover:bg-amber-500/25 transition-colors
                                   disabled:opacity-50 disabled:cursor-not-allowed">
                        {updating === asset.id ? "Updating…" : "Start repair"}
                      </button>
                    )}
                    {asset.status === "Under Repair" && (
                      <button
                        disabled={updating === asset.id}
                        onClick={() => updateAssetStatus(asset.id, "Available")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300
                                   text-xs font-medium hover:bg-emerald-500/25 transition-colors
                                   disabled:opacity-50 disabled:cursor-not-allowed">
                        {updating === asset.id ? "Updating…" : "Mark as repaired"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active assignments */}
      {!loading && assignments.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3">
            Active asset assignments
          </h2>
          <div className="rounded-xl bg-[#1E293B] border border-white/5 overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-white/5">
                  {["Assignment ID", "Asset", "Assigned", "Returned"].map((h) => (
                    <th key={h}
                      className="text-left px-4 py-3 text-xs font-semibold
                                 text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments
                  .filter((a) => !a.returned_at)
                  .map((a) => (
                    <tr key={a.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/2">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {a.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs font-mono">
                        {a.asset_id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(a.assigned_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-amber-400">Still in use</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}