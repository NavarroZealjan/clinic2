"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function DoctorReportsPage() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/reports/stats")
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err)
    }
  }

  if (error) return <div>Failed to load reports</div>
  if (!stats) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Header */}
      <div className="bg-[#00A8E8] text-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/doctor/dashboard")}
            className="text-white hover:bg-white/20 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span className="text-sm">Home &gt; Reports</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">REPORTS</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Appointment Trends Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">APPOINTMENT TRENDS</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="#00A8E8"
                  strokeWidth={3}
                  dot={{ fill: "#00A8E8", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Performance Cards */}
          <div className="space-y-6">
            {/* Clinic Performance */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">CLINIC PERFORMANCE</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold">₱{stats.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Month</div>
                  <div className="text-sm font-medium">Total Revenue</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.patientSatisfaction}%</div>
                  <div className="text-sm font-medium">Patient Satisfaction</div>
                </div>
              </div>
            </Card>

            {/* Total Appointments */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">TOTAL APPOINTMENTS</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold">{stats.totalAppointments}</div>
                  <div className="text-sm font-medium">Total Appointments</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.noShows}</div>
                  <div className="text-sm font-medium">No-Show</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Appointments Table */}
        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>TIME</TableHead>
                <TableHead>PATIENT NAME</TableHead>
                <TableHead>PHYSICIAN</TableHead>
                <TableHead>DURATION (MIN)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentAppointments.map((appointment, index) => (
                <TableRow key={appointment.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{appointment.date}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.patientName}</TableCell>
                  <TableCell>{appointment.physician}</TableCell>
                  <TableCell>{appointment.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
