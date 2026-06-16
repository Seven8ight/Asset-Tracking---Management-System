const LOGS = [
  { user: "Jane Mwangi", action: "Updated asset status", target: "Laptop #042 → In Use", time: "Today, 09:14 AM", type: "update" },
  { user: "Mary Wanjiku", action: "Flagged asset for repair", target: "Projector #017 → Under Repair", time: "Today, 08:52 AM", type: "warning" },
  { user: "John Kamau", action: "Added staff member", target: "Alice Mutua → IT Department", time: "Today, 08:30 AM", type: "create" },
  { user: "David Njoroge", action: "Returned asset", target: "Drill #008 → Available", time: "Yesterday, 04:45 PM", type: "update" },
  { user: "Jane Mwangi", action: "Created department", target: "IT Lab", time: "Yesterday, 02:10 PM", type: "create" },
  { user: "Peter Odhiambo", action: "Deleted asset", target: "Old Scanner #003", time: "Yesterday, 11:00 AM", type: "delete" },
  { user: "Alice Mutua", action: "Claimed ownership", target: "Office Chair #22 → In Use", time: "2 days ago", type: "update" },
];

const TYPE_STYLES: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-400",
  update: "bg-indigo-500/10 text-indigo-400",
  warning: "bg-amber-500/10 text-amber-400",
  delete: "bg-red-500/10 text-red-400",
};

export default function AuditLogsPage() {
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

      <div className="rounded-xl bg-[#1E293B] border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {["User", "Action", "Target", "Type", "Time"].map((h) => (
                <th key={h}
                  className="text-left px-4 py-3 text-xs font-semibold 
                             text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LOGS.map((log, i) => (
              <tr key={i}
                className="border-b border-white/5 last:border-0 
                           hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-slate-300 font-medium whitespace-nowrap">
                  {log.user}
                </td>
                <td className="px-4 py-3 text-slate-400">{log.action}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{log.target}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                    ${TYPE_STYLES[log.type]}`}>
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