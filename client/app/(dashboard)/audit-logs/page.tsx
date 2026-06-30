"use client";

import { useEffect, useState } from "react";
import { auditApi } from "@/lib/api";

type AuditLog = {
  id: string;
  user_id: string;
  username?: string;
  department_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  created_at: string;
};

type ApiResponse<T> = {
  response?: {
    message?: T;
  };
};

type UiLog = {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: "create" | "update" | "warning" | "delete";
};

const TYPE_STYLES: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-400",
  update: "bg-indigo-500/10 text-indigo-400",
  warning: "bg-amber-500/10 text-amber-400",
  delete: "bg-red-500/10 text-red-400",
};

const inferType = (action: string): UiLog["type"] => {
  const normalized = action.toLowerCase();

  if (normalized.includes("delet")) return "delete";
  if (normalized.includes("repair") || normalized.includes("broken"))
    return "warning";
  if (normalized.includes("creat") || normalized.includes("invitation"))
    return "create";

  return "update";
};

const formatTarget = (log: AuditLog): string => {
  const newValues = log.new_values || {};
  const oldValues = log.old_values || {};

  const label =
    (newValues["name"] as string | undefined) ||
    (newValues["username"] as string | undefined) ||
    (oldValues["name"] as string | undefined) ||
    (oldValues["username"] as string | undefined) ||
    log.entity_id;

  return `${log.entity_type} · ${label}`;
};

const toUiLog = (log: AuditLog): UiLog => ({
  id: log.id,
  user: log.username?.trim() || `User ${log.user_id.slice(0, 8)}`,
  action: log.action,
  target: formatTarget(log),
  time: new Date(log.created_at).toLocaleString(),
  type: inferType(log.action),
});

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<UiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadLogs = async () => {
      try {
        setLoading(true);
        const response = (await auditApi.getDepartmentLogs()) as ApiResponse<
          AuditLog[]
        >;
        const rawLogs = response?.response?.message ?? [];

        if (!mounted) return;

        setLogs(Array.isArray(rawLogs) ? rawLogs.map(toUiLog) : []);
        setError("");
      } catch (err) {
        if (!mounted) return;
        setLogs([]);
        setError((err as Error).message || "Failed to load audit logs");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLogs();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          Audit Logs
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          A full history of every action taken in the system.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-[#1E293B] border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {["User", "Action", "Target", "Type", "Time"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold 
                             text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-5 text-slate-400 text-sm" colSpan={5}>
                  Loading audit logs...
                </td>
              </tr>
            )}

            {!loading && logs.length === 0 && (
              <tr>
                <td className="px-4 py-5 text-slate-400 text-sm" colSpan={5}>
                  No audit logs yet.
                </td>
              </tr>
            )}

            {!loading &&
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-white/5 last:border-0 
                           hover:bg-white/2 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-300 font-medium whitespace-nowrap">
                    {log.user}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{log.action}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {log.target}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                    ${TYPE_STYLES[log.type]}`}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {log.time}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
