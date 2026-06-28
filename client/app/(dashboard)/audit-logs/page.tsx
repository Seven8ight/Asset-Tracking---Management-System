"use client";

import { useState, useEffect } from "react";
import { auditApi } from "../../../lib/api";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  created_at: string;
}

const ACTION_STYLES: Record<string, string> = {
  "Creating": "bg-emerald-500/10 text-emerald-400",
  "Editing": "bg-indigo-500/10 text-indigo-400",
  "Deleting": "bg-red-500/10 text-red-400",
  "Asset assignment": "bg-amber-500/10 text-amber-400",
};

const getActionStyle = (action: string) => {
  const key = Object.keys(ACTION_STYLES).find((k) =>
    action.toLowerCase().includes(k.toLowerCase())
  );
  return key ? ACTION_STYLES[key] : "bg-slate-500/10 text-slate-400";
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await auditApi.getDepartmentLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        setApiError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          Audit Logs
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          A full history of every action taken in this department.
        </p>
      </div>

      {apiError && (
        <div className="p-3 rounded-md text-sm bg-red-500/10 border
                        border-red-500/20 text-red-300">
          {apiError}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-[#1E293B] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && logs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24
                        rounded-xl bg-[#1E293B] border border-dashed border-white/10">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">No logs yet</h3>
          <p className="text-sm text-slate-400 text-center max-w-xs">
            Actions taken in this department will appear here automatically.
          </p>
        </div>
      )}

      {!loading && logs.length > 0 && (
        <div className="rounded-xl bg-[#1E293B] border border-white/5 overflow-hidden">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5">
                {["Action", "Entity", "Type", "When", "Details"].map((h) => (
                  <th key={h}
                    className="text-left px-4 py-3 text-xs font-semibold
                               text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <>
                  <tr key={log.id}
                    className="border-b border-white/5 last:border-0
                               hover:bg-white/2 transition-colors cursor-pointer"
                    onClick={() =>
                      setExpanded(expanded === log.id ? null : log.id)
                    }>
                    <td className="px-4 py-3 text-slate-300 font-medium">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                      {log.entity_id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${getActionStyle(log.action)}`}>
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-indigo-400 hover:text-indigo-300">
                        {expanded === log.id ? "Hide ▲" : "Show ▼"}
                      </span>
                    </td>
                  </tr>

                  {/* Expanded row showing old/new values */}
                  {expanded === log.id && (
                    <tr key={`${log.id}-expanded`}
                      className="border-b border-white/5 bg-slate-900/30">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-500
                                          uppercase tracking-wider mb-2">
                              Before
                            </p>
                            <pre className="text-xs text-slate-400 bg-[#0F172A]
                                           rounded-lg p-3 overflow-x-auto">
                              {Object.keys(log.old_values).length === 0
                                ? "—"
                                : JSON.stringify(log.old_values, null, 2)
                              }
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500
                                          uppercase tracking-wider mb-2">
                              After
                            </p>
                            <pre className="text-xs text-slate-400 bg-[#0F172A]
                                           rounded-lg p-3 overflow-x-auto">
                              {Object.keys(log.new_values).length === 0
                                ? "—"
                                : JSON.stringify(log.new_values, null, 2)
                              }
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}