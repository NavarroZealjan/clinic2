"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  FileText,
  BarChart3,
  CreditCard,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  {
    name: "Patients",
    icon: Users,
    children: [
      { name: "Patient Management", href: "/patients/management" },
      { name: "Patient Information", href: "/patients/information" },
      { name: "Patient Records", href: "/patients/records" },
    ],
  },
  { name: "Appointment", href: "/appointment", icon: Calendar },
  { name: "Consultation History", href: "/consultation", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Billing", href: "/billing", icon: CreditCard },
];

export function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState(["Patients"]);

  const toggleExpanded = (name) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#0a2540] to-[#0d3a5f] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-sky-400 rounded-full flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M13 7h-2v5H7v2h4v4h2v-4h4v-2h-4z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wide">E-CLINIC</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-sky-300 mb-3 px-3">
            DASHBOARD
          </div>

          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isExpanded = expandedItems.includes(item.name);
            const hasChildren = "children" in item;

            return (
              <div key={item.name}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        "hover:bg-white/10"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              "block px-3 py-2 rounded-lg text-sm transition-colors",
                              pathname === child.href
                                ? "bg-white/10 text-white"
                                : "text-sky-200 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-sky-200 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
