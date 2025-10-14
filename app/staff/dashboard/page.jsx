"use client"

import { useEffect, useState } from "react"
import { User } from "lucide-react"

export default function StaffDashboardPage() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    approvedAppointments: 0,
    todayPatients: 0,
  })

  const [totalPatients, setTotalPatients] = useState(0)

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      user: "Zealjan",
      action: "booked an appointment",
      time: "2 mins ago",
      avatar: "bg-emerald-500",
    },
    {
      id: 2,
      user: "Dr. Smith",
      action: "Approved an appointment",
      time: "1 hour ago",
      avatar: "bg-blue-500",
    },
    {
      id: 3,
      user: "Admin",
      action: "add new patient",
      time: "10 mins ago",
      avatar: "bg-purple-400",
    },
  ])

  const [doctors, setDoctors] = useState([
    { id: 1, name: "DR. WISON", available: true },
    { id: 2, name: "DR. SMITH", available: true },
    { id: 3, name: "DR. WALES", available: false },
  ])

  useEffect(() => {
    fetchStats()
    fetchPatients()
    const interval = setInterval(() => {
      fetchStats()
      fetchPatients()
    }, 5000)
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

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients?limit=1")
      const data = await response.json()
      setTotalPatients(data.total || 0)
    } catch (error) {
      console.error("Error fetching patients:", error)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#0ea5e9] text-white px-8 py-4">
        <h1 className="text-xl font-semibold">Home</h1>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#0ea5e9] text-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl font-bold mb-2">{totalPatients}</div>
            <div className="text-sm opacity-90">Total Patients Today</div>
          </div>

          <div className="bg-[#38bdf8] text-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl font-bold mb-2">{stats.approvedAppointments}</div>
            <div className="text-sm opacity-90">Appointment Approved</div>
          </div>

          <div className="bg-[#ef4444] text-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl font-bold mb-2">{stats.pendingAppointments}</div>
            <div className="text-sm opacity-90">Appointment Pending</div>
          </div>

          <div className="bg-[#10b981] text-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl font-bold mb-2">{doctors.filter((d) => d.available).length}</div>
            <div className="text-sm opacity-90">Doctors Available</div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${activity.avatar} rounded-full flex items-center justify-center`}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-900">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Doctors Available */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Doctors Available</h2>
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`${
                    doctor.available ? "bg-[#10b981]" : "bg-[#ef4444]"
                  } text-white rounded-lg p-4 text-center font-medium`}
                >
                  {doctor.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
