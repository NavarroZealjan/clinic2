"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Calendar, FileText, BarChart3, CreditCard, ChevronDown, ChevronRight, LogOut, Users } from "lucide-react"

export default function StaffSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [appointmentOpen, setAppointmentOpen] = useState(false)

  const isActive = (path) => pathname === path

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <div className="w-64 bg-[#1a2942] min-h-screen text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-[#2a3952]">
        <div className="w-10 h-10 bg-[#0ea5e9] rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <span className="text-xl font-bold">E-CLINIC</span>
      </div>

      {/* Dashboard Label */}
      <div className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dashboard</div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <Link
          href="/staff/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
            isActive("/staff/dashboard")
              ? "bg-[#2a3952] text-white"
              : "text-gray-300 hover:bg-[#2a3952] hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <div className="mb-1">
          <button
            onClick={() => setAppointmentOpen(!appointmentOpen)}
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-[#2a3952] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              <span>Appointment</span>
            </div>
            {appointmentOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {appointmentOpen && (
            <div className="ml-8 mt-1 space-y-1">
              <Link
                href="/staff/appointments/pending"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Pending
              </Link>
              <Link
                href="/staff/appointments/approved"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Approved
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/staff/consultation-history"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
            isActive("/staff/consultation-history")
              ? "bg-[#2a3952] text-white"
              : "text-gray-300 hover:bg-[#2a3952] hover:text-white"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Consultation History</span>
        </Link>

        <Link
          href="/staff/reports"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
            isActive("/staff/reports") ? "bg-[#2a3952] text-white" : "text-gray-300 hover:bg-[#2a3952] hover:text-white"
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Reports</span>
        </Link>

        <Link
          href="/staff/patients"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
            isActive("/staff/patients")
              ? "bg-[#2a3952] text-white"
              : "text-gray-300 hover:bg-[#2a3952] hover:text-white"
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Patient Records</span>
        </Link>

        <Link
          href="/staff/billing"
          className="flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-300 hover:bg-[#2a3952] hover:text-white transition-colors"
        >
          <CreditCard className="w-5 h-5" />
          <span>Billing</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-[#2a3952]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
