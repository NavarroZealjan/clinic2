"use client"

import { Sidebar } from "@/components/sidebar"
import { StatCard } from "@/components/stat-card"
import { RecentActivity } from "@/components/recent-activity"
import { Notifications } from "@/components/notifications"
import { DoctorsAvailable } from "@/components/doctors-available"

export default function DoctorDashboardPage() {
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
            <StatCard value="6" label="Total Patients Today" color="blue" />
            <StatCard value="4" label="Appointment Approved" color="light-blue" />
            <StatCard value="3" label="Appointment Pending" color="coral" />
            <StatCard value="2" label="Doctors Available" color="green" />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Activity and Notifications */}
            <div className="lg:col-span-2 space-y-6">
              <RecentActivity />
              <Notifications />
            </div>

            {/* Right Column - Widgets */}
            <div className="space-y-6">
              <DoctorsAvailable />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
