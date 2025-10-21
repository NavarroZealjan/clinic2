"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Home } from "lucide-react"
import { useRouter } from "next/navigation"

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

export default function DoctorAvailabilityPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    dayOfWeek: "MONDAY",
    startTime: "08:00",
    endTime: "17:00",
    maxAppointmentsPerSlot: 3,
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      console.log("[v0] Current user from localStorage:", parsedUser)
      setUser(parsedUser)
      fetchAvailability(parsedUser.id)
    }
  }, [])

  const fetchAvailability = async (doctorId) => {
    try {
      console.log("[v0] Fetching availability for doctorId:", doctorId)
      const response = await fetch(`/api/doctor-availability?doctorId=${doctorId}`)
      if (response.ok) {
        const data = await response.json()
        setAvailability(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching availability:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("[v0] Submitting availability for doctorId:", user.id)
      const response = await fetch("/api/doctor-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: user.id,
          ...formData,
        }),
      })

      if (response.ok) {
        await fetchAvailability(user.id)
        setShowAddForm(false)
        setFormData({
          dayOfWeek: "MONDAY",
          startTime: "08:00",
          endTime: "17:00",
          maxAppointmentsPerSlot: 3,
        })
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Failed to add availability"
        setError(errorMessage)
        console.error("[v0] Server error:", errorData)
        alert(
          `Error: ${errorMessage}\n\nYour doctor ID (${user.id}) doesn't exist in the database.\n\nPlease:\n1. Log out from your account\n2. Log back in\n3. Try again\n\nIf the problem persists, contact support.`,
        )
      }
    } catch (error) {
      console.error("[v0] Error adding availability:", error)
      setError(error.message)
      alert("An error occurred: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this availability slot?")) return

    try {
      const response = await fetch(`/api/doctor-availability?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchAvailability(user.id)
      } else {
        alert("Failed to delete availability")
      }
    } catch (error) {
      console.error("[v0] Error deleting availability:", error)
      alert("An error occurred")
    }
  }

  const groupedAvailability = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = availability.filter((slot) => slot.day_of_week === day)
    return acc
  }, {})

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Availability</h1>
            <p className="text-slate-600 mt-2">Set your available hours for appointments</p>
            {user && (
              <p className="text-xs text-slate-500 mt-1">
                Logged in as: {user.full_name || user.username} (ID: {user.id})
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/doctor/dashboard")} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-cyan-500 hover:bg-cyan-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Availability
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-semibold">Error: {error}</p>
            <div className="mt-3 text-red-700 text-sm">
              <p className="font-medium">Your doctor ID ({user?.id}) doesn't exist in the database.</p>
              <p className="mt-2">Please follow these steps:</p>
              <ol className="list-decimal ml-5 mt-1 space-y-1">
                <li>Log out from your account</li>
                <li>Log back in</li>
                <li>Try again</li>
              </ol>
              <p className="mt-2 text-xs">If the problem persists, contact support.</p>
            </div>
          </div>
        )}

        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Availability Slot</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dayOfWeek">Day of Week</Label>
                    <select
                      id="dayOfWeek"
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="maxAppointments">Max Appointments per Slot</Label>
                    <Input
                      id="maxAppointments"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.maxAppointmentsPerSlot}
                      onChange={(e) =>
                        setFormData({ ...formData, maxAppointmentsPerSlot: Number.parseInt(e.target.value) })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-cyan-500 hover:bg-cyan-600">
                    {loading ? "Adding..." : "Add Slot"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS_OF_WEEK.map((day) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-lg">{day}</CardTitle>
              </CardHeader>
              <CardContent>
                {groupedAvailability[day]?.length > 0 ? (
                  <div className="space-y-2">
                    {groupedAvailability[day].map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                      >
                        <div className="text-sm">
                          <div className="font-medium">
                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                          </div>
                          <div className="text-slate-600 text-xs">Max: {slot.max_appointments_per_slot} patients</div>
                        </div>
                        <button onClick={() => handleDelete(slot.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No availability set</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
