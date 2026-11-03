import type { Metadata } from "next";
import { Eye } from "lucide-react";
import { requireAdminView } from "@/lib/admin/guard";
import { getKpis } from "@/lib/admin/queries";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin | Skate Garage" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { readOnly, user } = await requireAdminView();
  const kpis = await getKpis();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {readOnly && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Eye className="mt-0.5 h-4 w-4 shrink-0" />
          <p><span className="font-medium">Read-only demo admin.</span> Look around freely. Changes are disabled, so buttons will explain what they would do.</p>
        </div>
      )}
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <aside className="min-w-0 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</p>
            <p className="truncate text-sm">{user.email}</p>
          </div>
          <AdminNav pendingReturns={kpis.pending_returns} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
