import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Users, FileText, CheckSquare, CreditCard, ShieldAlert, FileClock } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Route protection
  if (!user || user.role !== "ADMIN") {
    redirect("/auth/login?callbackUrl=/admin");
  }

  const links = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Supplier Approvals", href: "/admin/suppliers", icon: Users },
    { label: "Fabric Moderation", href: "/admin/fabrics", icon: FileText },
    { label: "Payments Queue", href: "/admin/payments", icon: CreditCard },
    { label: "Bulk Orders", href: "/admin/orders", icon: CheckSquare },
    { label: "Disputes", href: "/admin/disputes", icon: ShieldAlert },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: FileClock },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <span className="text-sm font-bold text-white uppercase tracking-widest block">ADMIN CONTROL</span>
          <span className="text-xs text-slate-400 mt-1 block">TexSurat Hub Manager</span>
        </div>
        <nav className="flex-grow p-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold hover:bg-slate-800 hover:text-white transition-all"
            >
              <link.icon className="h-4 w-4 text-slate-400" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content pane */}
      <main className="flex-grow p-6 md:p-10">{children}</main>
    </div>
  );
}
