import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TexSurat | B2B Textile Sourcing Marketplace",
  description: "Source fabrics directly from Surat. Order physical samples, test fabric quality, negotiate bulk pricing, and buy with confidence from verified manufacturers.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar currentUser={currentUser} />
        <main className="flex-grow flex flex-col">{children}</main>
        
        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <span className="text-xl font-extrabold text-white">
                TEX<span className="text-blue-500">SURAT</span>
              </span>
              <p className="text-sm">
                Surat's leading B2B sourcing platform bridging the gap between top manufacturers and textile buyers.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Sourcing</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/fabrics" className="hover:text-white transition-colors">Browse Fabrics</Link></li>
                <li><Link href="/#suppliers" className="hover:text-white transition-colors">Verified Suppliers</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How Sourcing Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Partnership</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/register?role=SUPPLIER" className="hover:text-white transition-colors">Become a Supplier</Link></li>
                <li><Link href="/auth/register?role=BUYER" className="hover:text-white transition-colors">Register as Buyer</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Support & Trust</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#how-it-works" className="hover:text-white transition-colors">100% Quality Check</Link></li>
                <li><span className="block text-slate-500">24/7 Dispute Mediation</span></li>
                <li><span className="block text-slate-500">Secure UTR Settlement</span></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-slate-800 mt-8 pt-8 text-center text-xs">
            <p>&copy; {new Date().getFullYear()} TexSurat Marketplace. All rights reserved. Built for B2B Textile Sourcing.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
