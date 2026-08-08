import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, SendHorizontal, MessageSquare, ClipboardList, Star, Bell, UserCircle } from "lucide-react";

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "BUYER" || !user.buyerProfile) {
    redirect("/auth/login?callbackUrl=/buyer");
  }

  const profile = user.buyerProfile;

  const links = [
    { label: "Overview", href: "/buyer", icon: LayoutDashboard },
    { label: "My Samples", href: "/buyer/samples", icon: ShoppingBag },
    { label: "Quote Requests (RFQs)", href: "/buyer/quotes", icon: SendHorizontal },
    { label: "Negotiations", href: "/buyer/negotiations", icon: MessageSquare },
    { label: "Bulk Orders", href: "/buyer/orders", icon: ClipboardList },
    { label: "Saved Items", href: "/buyer/saved", icon: Star },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <span className="text-sm font-bold text-white uppercase tracking-widest block font-sans">
            {profile.businessName}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Buyer Procurement Portal</span>
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
