"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import { User, Menu, X, Bell, ShoppingBag, MessageSquare } from "lucide-react";

interface NavbarProps {
  currentUser: {
    id: string;
    email: string;
    role: string;
    buyerProfile?: { businessName: string } | null;
    supplierProfile?: { businessName: string } | null;
  } | null;
}

export default function Navbar({ currentUser }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Navigation Links
  const navLinks = [
    { label: "Fabrics", href: "/fabrics" },
    { label: "Suppliers", href: "/#suppliers" },
    { label: "How It Works", href: "/#how-it-works" },
  ];

  const getDashboardLink = () => {
    if (!currentUser) return null;
    if (currentUser.role === "ADMIN") return "/admin";
    if (currentUser.role === "SUPPLIER") return "/supplier";
    return "/buyer";
  };

  const getDashboardLabel = () => {
    if (!currentUser) return "";
    if (currentUser.role === "ADMIN") return "Admin Panel";
    if (currentUser.role === "SUPPLIER") return "Supplier Panel";
    return "Buyer Panel";
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-100 font-sans sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                TEX<span className="text-blue-500">SURAT</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors ${
                    pathname === link.href
                      ? "border-blue-500 text-white"
                      : "border-transparent text-slate-300 hover:text-white hover:border-slate-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Right Panel */}
          <div className="hidden sm:flex sm:items-center sm:ml-6 space-x-4">
            {currentUser ? (
              <>
                <Link
                  href={getDashboardLink() || "/"}
                  className="px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
                >
                  {getDashboardLabel()}
                </Link>
                <div className="text-xs text-slate-400 border-l border-slate-800 pl-4 py-1">
                  <span className="block font-medium text-slate-200">
                    {currentUser.role === "SUPPLIER"
                      ? currentUser.supplierProfile?.businessName
                      : currentUser.role === "BUYER"
                      ? currentUser.buyerProfile?.businessName
                      : "System Admin"}
                  </span>
                  <span className="block opacity-75">{currentUser.email}</span>
                </div>
                <button
                  onClick={() => logoutAction()}
                  className="text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register?role=SUPPLIER"
                  className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors border border-slate-700 rounded-md hover:border-slate-500"
                >
                  Become a Supplier
                </Link>
                <Link
                  href="/auth/register?role=BUYER"
                  className="text-sm font-semibold rounded-md bg-white text-slate-900 px-4 py-2 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Explore Fabrics
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="sm:hidden bg-slate-900 border-b border-slate-800 px-2 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                pathname === link.href ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-slate-800 my-2 pt-2">
            {currentUser ? (
              <div className="px-3 space-y-2">
                <div className="text-sm text-slate-400 py-1">
                  <span className="block font-medium text-slate-200">
                    {currentUser.role === "SUPPLIER"
                      ? currentUser.supplierProfile?.businessName
                      : currentUser.role === "BUYER"
                      ? currentUser.buyerProfile?.businessName
                      : "System Admin"}
                  </span>
                  <span className="block text-xs opacity-75">{currentUser.email}</span>
                </div>
                <Link
                  href={getDashboardLink() || "/"}
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-all"
                >
                  {getDashboardLabel()}
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logoutAction();
                  }}
                  className="block w-full text-center text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 py-2 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="px-3 space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full text-sm font-semibold text-slate-300 hover:text-white py-2 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register?role=SUPPLIER"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full text-sm font-semibold text-slate-300 hover:text-white py-2 border border-slate-800 rounded-md"
                >
                  Become a Supplier
                </Link>
                <Link
                  href="/auth/register?role=BUYER"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full text-sm font-semibold rounded-md bg-white text-slate-900 py-2 hover:bg-slate-100"
                >
                  Explore Fabrics
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
