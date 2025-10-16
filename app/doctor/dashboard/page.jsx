"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { StatCard } from "@/components/stat-card"
import { RecentActivity } from "@/components/recent-activity"
import { DoctorsAvailable } from "@/components/doctors-available"

export default function DoctorDashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointmentsApproved: 0,
    appointmentsPending: 0,
    doctorsAvailable: 2,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch patients count
        const patientsRes = await fetch("/api/patients")
        const patientsData = await patientsRes.json()

        // Fetch appointments stats
        const appointmentsRes = await fetch("/api/appointments/stats")
        const appointmentsData = await appointmentsRes.json()

        setStats({
          totalPatients: patientsData.total || 0,
          appointmentsApproved: appointmentsData.approved || 0,
          appointmentsPending: appointmentsData.pending || 0,
          doctorsAvailable: 2, // Static for now
        })
      } catch (error) {
        console.error("[v0] Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1">
        {/* Header */}
        <header className="h-14 flex items-center px-8" style={{ backgroundColor: "var(--header-bg)" }}>
          <h1 className="text-xl font-semibold text-white">Home</h1>
        </header>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard value={loading ? "..." : stats.totalPatients.toString()} label="Total Patients" color="blue" />
            <StatCard
              value={loading ? "..." : stats.appointmentsApproved.toString()}
              label="Appointment Approved"
              color="light-blue"
            />
            <StatCard
              value={loading ? "..." : stats.appointmentsPending.toString()}
              label="Appointment Pending"
              color="coral"
            />
            <StatCard
              value={loading ? "..." : stats.doctorsAvailable.toString()}
              label="Doctors Available"
              color="green"
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>

            <div>
              <DoctorsAvailable />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
