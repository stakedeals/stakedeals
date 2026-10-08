"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Settings,
  Clock,
} from "lucide-react";
import { AdminCatalogSection } from "@/components/catalog/AdminCatalogSection";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [status, setStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((res) => res.json()),
      fetch("/api/system/status").then((res) => res.json()),
    ])
      .then(([userData, statusData]) => {
        if (!userData.authenticated) {
          router.push("/login");
          return;
        }

        const isStaff = userData.user.roles.some((r: string) =>
          ["owner", "product_manager", "cash_manager", "partner_manager", "sd_patron_manager"].includes(r)
        );

        if (!isStaff) {
          router.push("/dashboard");
          return;
        }

        setUser(userData.user);
        setStatus(statusData);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-xs text-zinc-500">Checking Staff Permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || !status) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-3xl border border-purple-200/60 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent p-6 sm:p-8 dark:border-purple-900/50 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-300">
              <ShieldCheck className="h-4 w-4" />
              Staff Administration Panel
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-zinc-500">
              Active Roles: {user.roles.join(", ")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
            StakeDeals Management Console
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Role-Based Access Control and immutable transaction records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            System: {status.status}
          </span>
        </div>
      </div>

      {/* Database & Counts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-zinc-400 text-xs block">Registered Users</span>
          <strong className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {status.database?.tables?.users || 0}
          </strong>
          <span className="text-[10px] text-zinc-500 block mt-1">Single User Model</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-zinc-400 text-xs block">Configured Roles</span>
          <strong className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {status.database?.tables?.roles || 0}
          </strong>
          <span className="text-[10px] text-zinc-500 block mt-1">System Roles</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-zinc-400 text-xs block">RBAC Permissions</span>
          <strong className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {status.database?.tables?.permissions || 0}
          </strong>
          <span className="text-[10px] text-zinc-500 block mt-1">Granular Rights</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-zinc-400 text-xs block">Audit Log Entries</span>
          <strong className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {status.database?.tables?.auditLogsTotal || 0}
          </strong>
          <span className="text-[10px] text-zinc-500 block mt-1">Immutable Trail</span>
        </div>
      </div>

      {/* Platform Settings Snapshot */}
      <AdminCatalogSection userRoles={user.roles || []} />

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Admin-Configured Platform Settings
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Never hardcoded in financial logic</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {Object.entries(status.platformSettings || {}).map(([key, setting]: any) => (
            <div
              key={key}
              className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-1"
            >
              <span className="font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
                {key}
              </span>
              <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                {setting.value}
              </div>
              <p className="text-[10px] text-zinc-400">{setting.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audit Trail Preview */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Immutable System Audit Log (Recent Entries)
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400 dark:border-zinc-800 text-[10px] uppercase">
                <th className="py-2">Timestamp</th>
                <th className="py-2">Action</th>
                <th className="py-2">Entity</th>
                <th className="py-2">Actor ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {(status.recentAuditLogs || []).map((log: any) => (
                <tr key={log.id} className="text-zinc-700 dark:text-zinc-300">
                  <td className="py-2 font-mono text-[10px]">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-2 font-semibold text-purple-600 dark:text-purple-400">
                    {log.action}
                  </td>
                  <td className="py-2 font-mono text-[10px]">
                    {log.entityType} ({log.entityId})
                  </td>
                  <td className="py-2 font-mono text-[10px] text-zinc-400">
                    {log.actorId || "system"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
