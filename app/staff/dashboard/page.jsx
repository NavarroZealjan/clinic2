"use client"

import { useEffect, useState } from "react"
import StatCard from "@/components/stat-card"
import { Users, Calendar, CheckCircle, Clock } from "lucide-react"

export default function StaffDashboardPage() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    approvedAppointments: 0,
    todayPatients: 0,
  })

  useEffect(() => {
    fetchStats()
    // Refresh stats every 5 seconds
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/appointments/stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon={<Calendar className="w-6 h-6" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Pending Appointments"
          value={stats.pendingAppointments}
          icon={<Clock className="w-6 h-6" />}
          trend="Awaiting approval"
          trendUp={false}
        />
        <StatCard
          title="Approved Appointments"
          value={stats.approvedAppointments}
          icon={<CheckCircle className="w-6 h-6" />}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="Today's Patients"
          value={stats.todayPatients}
          icon={<Users className="w-6 h-6" />}
          trend="Active today"
          trendUp={true}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/staff/appointments/pending" className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
            <h3 className="font-medium mb-2">Manage Appointments</h3>
            <p className="text-sm text-slate-600">View and manage pending appointments</p>
          </a>
          <a href="/doctor/patients" className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
            <h3 className="font-medium mb-2">Patient Management</h3>
            <p className="text-sm text-slate-600">View and manage patient records</p>
          </a>
          <a href="/book-appointment" className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
            <h3 className="font-medium mb-2">Book Appointment</h3>
            <p className="text-sm text-slate-600">Create a new appointment for a patient</p>
          </a>
        </div>
      </div>
    </div>
  )
}
