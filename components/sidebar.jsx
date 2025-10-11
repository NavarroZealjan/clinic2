"use client"

import { Home, Users, Calendar, FileText, BarChart3, CreditCard, ChevronDown, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth"

export function Sidebar() {
  const [isPatientsOpen, setIsPatientsOpen] = useState(false)
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <aside
      className="w-64 min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--sidebar-bg)", color: "var(--sidebar-text)" }}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-sky-400" />
          </div>
          <span className="text-lg font-bold">E-CLINIC</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="mb-6">
          <div className="text-xs font-semibold text-white/50 mb-3 px-3">DASHBOARD</div>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
            <Home className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </button>

          <div>
            <button
              onClick={() => setIsPatientsOpen(!isPatientsOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium flex-1 text-left">Patients</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isPatientsOpen ? "rotate-180" : ""}`} />
            </button>

            {isPatientsOpen && (
              <div className="ml-11 mt-1 space-y-1">
                <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white transition-colors">
                  Patient Management
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white transition-colors">
                  Patient Information
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white transition-colors">
                  Patient Records
                </button>
              </div>
            )}
          </div>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Appointment</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Consultation History</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">Billing</span>
          </button>
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
