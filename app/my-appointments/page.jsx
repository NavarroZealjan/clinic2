"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, User, X, Edit } from "lucide-react"

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [rescheduleModal, setRescheduleModal] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
    doctorName: "",
  })
  const [availableSlots, setAvailableSlots] = useState([])

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (rescheduleData.date) {
      generateTimeSlots()
    }
  }, [rescheduleData.date])

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors")
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching doctors:", error)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      if (hour < 17) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`)
      }
    }
    setAvailableSlots(slots)
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSearchPerformed(true)

    try {
      const response = await fetch(`/api/appointments/search?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      } else {
        setAppointments([])
      }
    } catch (error) {
      console.error("[v0] Error searching appointments:", error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (appointmentId) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (response.ok) {
        alert("Appointment cancelled successfully")
        handleSearch({ preventDefault: () => {} })
      } else {
        alert("Failed to cancel appointment")
      }
    } catch (error) {
      console.error("[v0] Error cancelling appointment:", error)
      alert("An error occurred")
    }
  }

  const openRescheduleModal = (appointment) => {
    setRescheduleModal(appointment)
    setRescheduleData({
      date: appointment.appointmentDate,
      time: appointment.appointmentTime,
      doctorName: appointment.doctorName || "",
    })
  }

  const handleReschedule = async (e) => {
    e.preventDefault()

    if (!rescheduleData.date || !rescheduleData.time) {
      alert("Please select both date and time")
      return
    }

    try {
      const response = await fetch(`/api/appointments/${rescheduleModal.id}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentDate: rescheduleData.date,
          appointmentTime: rescheduleData.time,
          doctorName: rescheduleData.doctorName || rescheduleModal.doctorName,
        }),
      })

      if (response.ok) {
        alert("Appointment rescheduled successfully")
        setRescheduleModal(null)
        handleSearch({ preventDefault: () => {} })
      } else {
        alert("Failed to reschedule appointment")
      }
    } catch (error) {
      console.error("[v0] Error rescheduling appointment:", error)
      alert("An error occurred")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
            <p className="text-slate-600 mb-6">View, reschedule, or cancel your appointments</p>

            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="email">Enter your email to view appointments</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600">
                  Search
                </Button>
              </div>
            </form>
          </div>

          {loading && searchPerformed && (
            <div className="text-center py-8">
              <div className="text-lg">Loading appointments...</div>
            </div>
          )}

          {!loading && searchPerformed && appointments.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-slate-600">No appointments found for this email address.</p>
            </div>
          )}

          {!loading && appointments.length > 0 && (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{appointment.fullName}</CardTitle>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}
                      >
                        {appointment.status.toUpperCase()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{appointment.appointmentDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.appointmentTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4" />
                        <span>{appointment.doctorName || "Dr. Smith"}</span>
                      </div>
                    </div>

                    {appointment.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openRescheduleModal(appointment)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Reschedule
                        </Button>
                        <Button
                          onClick={() => handleCancel(appointment.id)}
                          variant="outline"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {appointment.status === "approved" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openRescheduleModal(appointment)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Reschedule
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {rescheduleModal && (
        <Dialog open={!!rescheduleModal} onOpenChange={() => setRescheduleModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleReschedule} className="space-y-4">
              <div>
                <Label htmlFor="rescheduleDoctor">Select Doctor</Label>
                <select
                  id="rescheduleDoctor"
                  value={rescheduleData.doctorName}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, doctorName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Keep current doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.full_name}>
                      {doctor.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="rescheduleDate">New Date</Label>
                <Input
                  id="rescheduleDate"
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  min={getMinDate()}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Select Time Slot</Label>
                {rescheduleData.date ? (
                  <div className="mt-2 grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setRescheduleData({ ...rescheduleData, time: slot })}
                        className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                          rescheduleData.time === slot
                            ? "bg-cyan-500 text-white border-cyan-500"
                            : "bg-white text-slate-700 border-slate-300 hover:border-cyan-500"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Please select a date first</p>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setRescheduleModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600">
                  Confirm Reschedule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
