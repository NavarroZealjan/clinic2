"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, X, Eye } from "lucide-react"

export default function AppointmentsPendingPage() {
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
    const filtered = appointments.filter(
      (apt) => apt.status === "pending" && apt.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredAppointments(filtered)
  }, [searchTerm, appointments])

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments")
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error("[v0] Error fetching appointments:", error)
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
        console.log(`[v0] Appointment ${id} ${status}`)
        fetchAppointments()
      }
    } catch (error) {
      console.error("[v0] Error updating appointment:", error)
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
    <div className="min-h-screen bg-slate-50">
      <div className="bg-cyan-500 text-white px-6 py-4">
        <div className="text-sm">Home &gt; Appointment Pending</div>
      </div>

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Appointment Pending</h1>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
              <div className="w-4 h-3 border-2 border-white"></div>
            </div>
            <span className="font-medium">List of Appointment</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Show</span>
              <select className="border rounded px-3 py-1 text-sm">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-sm">entries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Search</span>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 h-9"
              />
            </div>
          </div>

          <div className="border rounded">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-16 text-center font-semibold">#</TableHead>
                  <TableHead className="font-semibold">STATUS</TableHead>
                  <TableHead className="font-semibold">PATIENT NAME</TableHead>
                  <TableHead className="font-semibold">DATE APPOINTMENT</TableHead>
                  <TableHead className="font-semibold">TIME SLOT</TableHead>
                  <TableHead className="font-semibold">ACTIONS</TableHead>
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
                      No pending appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment, index) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>
                        <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white">Pending</Badge>
                      </TableCell>
                      <TableCell className="font-medium uppercase">{appointment.fullName}</TableCell>
                      <TableCell>{formatDate(appointment.appointmentDate)}</TableCell>
                      <TableCell>{appointment.appointmentTime}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 h-8 w-8 p-0"
                            onClick={() => handleStatusUpdate(appointment.id, "approved")}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-cyan-500 hover:bg-cyan-600 h-8 w-8 p-0"
                            onClick={() => viewAppointment(appointment)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => handleStatusUpdate(appointment.id, "rejected")}
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
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-600">
              Showing 1 to {filteredAppointments.length} of {filteredAppointments.length} entries
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
