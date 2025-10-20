"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, X, Eye } from "lucide-react"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    const filtered = appointments.filter((apt) => apt.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredAppointments(filtered)
  }, [searchTerm, appointments])

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments")
      const data = await response.json()
      setAppointments(data)
      setFilteredAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchAppointments()
        if (status === "approved") {
          alert("✅ Appointment approved successfully!")
        } else if (status === "rejected") {
          alert("❌ Appointment rejected successfully.")
        }
      } else {
        alert("⚠️ Failed to update appointment. Please try again.")
      }
    } catch (error) {
      console.error("Error updating appointment:", error)
      alert("⚠️ Failed to update appointment. Please try again.")
    }
  }

  const viewAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDialog(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="p-6">
      <div className="bg-cyan-500 text-white p-4 mb-6 rounded-t-lg">
        <div className="text-sm">Home &gt; Appointment Pending</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Appointment Pending</h1>

        <div className="border rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Show</span>
              <select className="border rounded px-2 py-1">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-sm">entries</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm">Search</span>
              <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-48" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>PATIENT NAME</TableHead>
                <TableHead>DATE APPOINTMENT</TableHead>
                <TableHead>TIME SLOT</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment, index) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          appointment.status === "pending"
                            ? "default"
                            : appointment.status === "approved"
                              ? "success"
                              : "destructive"
                        }
                        className={
                          appointment.status === "pending"
                            ? "bg-cyan-500"
                            : appointment.status === "approved"
                              ? "bg-emerald-500"
                              : "bg-red-500"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium uppercase">{appointment.fullName}</TableCell>
                    <TableCell>{formatDate(appointment.appointmentDate)}</TableCell>
                    <TableCell>{appointment.appointmentTime}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => handleStatusUpdate(appointment.id, "approved")}
                          disabled={appointment.status !== "pending"}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-cyan-500 text-cyan-500 hover:bg-cyan-50 bg-transparent"
                          onClick={() => viewAppointment(appointment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(appointment.id, "rejected")}
                          disabled={appointment.status !== "pending"}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-600">
              Showing 1 to {filteredAppointments.length} of {filteredAppointments.length} entries
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button size="sm" className="bg-cyan-500">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Patient Name</p>
                  <p className="text-base">{selectedAppointment.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="text-base">{selectedAppointment.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Contact Number</p>
                  <p className="text-base">{selectedAppointment.contactNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Date of Birth</p>
                  <p className="text-base">{formatDate(selectedAppointment.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Gender</p>
                  <p className="text-base">{selectedAppointment.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Blood Type</p>
                  <p className="text-base">{selectedAppointment.bloodType}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-slate-500">Address</p>
                  <p className="text-base">{selectedAppointment.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Emergency Contact</p>
                  <p className="text-base">{selectedAppointment.emergencyContactName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Emergency Number</p>
                  <p className="text-base">{selectedAppointment.emergencyContactNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Appointment Date</p>
                  <p className="text-base">{formatDate(selectedAppointment.appointmentDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Appointment Time</p>
                  <p className="text-base">{selectedAppointment.appointmentTime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <Badge
                    className={
                      selectedAppointment.status === "pending"
                        ? "bg-cyan-500"
                        : selectedAppointment.status === "approved"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                    }
                  >
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
