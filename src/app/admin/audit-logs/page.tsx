import React from "react";
import { db } from "@/lib/db";
import { FileClock } from "lucide-react";

export default async function AdminAuditLogsPage() {
  const logs = await db.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileClock className="h-6 w-6 text-blue-600" /> Platform Audit Logs
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5 font-medium">
          Real-time record of sensitive operations, status shifts, and payment clearances.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Actor ID</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Entity Type</th>
              <th className="px-6 py-4">Entity ID</th>
              <th className="px-6 py-4">State Transition</th>
              <th className="px-6 py-4">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-mono text-slate-500">
                  {log.actorId.slice(0, 8)}...
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase font-bold text-[9px] tracking-wider">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{log.entityType}</td>
                <td className="px-6 py-4 font-mono">{log.entityId}</td>
                <td className="px-6 py-4 text-slate-600">
                  {log.oldState ? (
                    <span className="flex items-center gap-1">
                      <span className="line-through text-slate-400">{log.oldState}</span>
                      <span>&rarr;</span>
                      <span className="text-slate-900 font-extrabold">{log.newState}</span>
                    </span>
                  ) : (
                    <span className="text-slate-900 font-extrabold">{log.newState || "N/A"}</span>
                  )}
                </td>
                <td className="px-6 py-4 max-w-[200px] truncate text-slate-500 font-mono text-[10px]">
                  {log.metadata ? JSON.stringify(log.metadata) : "{}"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
