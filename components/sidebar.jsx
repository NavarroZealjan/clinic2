"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, Users, FileText, LogOut, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

const menuItems = [
  { icon: Home, label: "Home", href: "/doctor/dashboard" },
  { icon: Calendar, label: "Appointments", href: "/doctor/appointments" },
  {
    icon: Users,
    label: "Patients",
    href: "/doctor/patients",
    subItems: [
      { label: "Patient Management", href: "/doctor/patients" },
      { label: "Patient Records", href: "/doctor/patients/records" },
    ],
  },
  { icon: Calendar, label: "Availability", href: "/doctor/availability" },
  { icon: FileText, label: "Reports", href: "/doctor/reports" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedItems, setExpandedItems] = useState(["Patients"])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const toggleExpand = (label) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  return (
    <aside className="w-64 min-h-screen" style={{ backgroundColor: "var(--sidebar-bg)" }}>
      {/* Logo */}
      <div className="h-14 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg">E-CLINIC</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          const isExpanded = expandedItems.includes(item.label)
          const hasSubItems = item.subItems && item.subItems.length > 0

          return (
            <div key={item.label}>
              {hasSubItems ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={cn(
                      "flex items-center justify-between w-full gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive ? "bg-cyan-500 text-white" : "text-gray-300 hover:bg-white/10",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm",
                              isSubActive ? "bg-cyan-500/80 text-white" : "text-gray-400 hover:bg-white/5",
                            )}
                          >
                            <span>{subItem.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive ? "bg-cyan-500 text-white" : "text-gray-300 hover:bg-white/10",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
