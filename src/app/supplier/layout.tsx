import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Scissors, PlusCircle, ShoppingBag, FolderHeart, MessageSquare, Bell, UserCircle, Hourglass, ShieldAlert } from "lucide-react";

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "SUPPLIER" || !user.supplierProfile) {
    redirect("/auth/login?callbackUrl=/supplier");
  }

  const profile = user.supplierProfile;

  const links = [
    { label: "Overview", href: "/supplier", icon: LayoutDashboard },
    { label: "My Fabrics", href: "/supplier/fabrics", icon: Scissors },
    { label: "Add Fabric", href: "/supplier/fabrics/new", icon: PlusCircle },
    { label: "Sample Requests", href: "/supplier/samples", icon: ShoppingBag },
    { label: "Quote Requests (RFQs)", href: "/supplier/quotes", icon: MessageSquare },
    { label: "Negotiations", href: "/supplier/negotiations", icon: MessageSquare },
    { label: "Bulk Orders", href: "/supplier/orders", icon: ShoppingBag },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <span className="text-sm font-bold text-white uppercase tracking-widest block">
            {profile.businessName}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Surat Supplier Portal</span>
        </div>
        
        {/* Navigation list */}
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
      <div className="flex-grow p-6 md:p-10 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Supplier status warning banner if not fully verified */}
          {profile.status === "PENDING" && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md flex gap-3">
              <Hourglass className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div className="text-xs text-amber-700">
                <h4 className="font-bold">Application Pending Verification</h4>
                <p className="mt-0.5">
                  Your Surat supplier application is currently under review by our admin team. You can view negotiations and drafts, but you cannot publicly publish new fabrics until verified.
                </p>
              </div>
            </div>
          )}

          {profile.status === "REJECTED" && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex gap-3">
              <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="text-xs text-red-700">
                <h4 className="font-bold">Application Rejected</h4>
                <p className="mt-0.5">
                  Your supplier application has been rejected by administration. Please contact support to review details.
                </p>
              </div>
            </div>
          )}

          {profile.status === "SUSPENDED" && (
            <div className="bg-red-950 text-red-100 p-6 rounded-md flex gap-4 items-center">
              <ShieldAlert className="h-10 w-10 text-red-400" />
              <div>
                <h4 className="font-bold text-lg">Account Suspended</h4>
                <p className="text-sm opacity-90 mt-1">
                  Your supplier portal has been suspended for policy violations.Sourcing features have been disabled.
                </p>
              </div>
            </div>
          )}

          {profile.status !== "SUSPENDED" && children}
        </div>
      </div>
    </div>
  );
}
