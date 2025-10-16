"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, MapPin, Droplet, Users } from "lucide-react"

export default function StaffPatientDetailPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  let patientData // Declare patientData variable

  useEffect(() => {
    fetchPatientData()
  }, [id])

  const fetchPatientData = async () => {
    try {
      // Fetch patient details
      const patientResponse = await fetch(`/api/patients/${id}`)
      if (patientResponse.ok) {
        patientData = await patientResponse.json() // Assign patientData here
        const transformedPatient = {
          id: patientData.id,
          fullName: patientData.full_name,
          email: patientData.email,
          phone: patientData.phone,
          address: patientData.address,
          dateOfBirth: patientData.date_of_birth,
          age: calculateAge(patientData.date_of_birth),
          gender: patientData.gender,
          bloodType: patientData.blood_type,
          emergencyContact: patientData.emergency_contact_name,
          emergencyPhone: patientData.emergency_contact_number,
          dateCreated: new Date(patientData.created_at).toLocaleString(),
        }
        setPatient(transformedPatient)
      }

      // Fetch appointments for this patient
      const appointmentsResponse = await fetch("/api/appointments")
      if (appointmentsResponse.ok) {
        const allAppointments = await appointmentsResponse.json()
        // Filter appointments for this patient by matching phone number
        const patientAppointments = allAppointments.filter((apt) => apt.contactNumber === patientData.phone)
        setAppointments(patientAppointments)
      }
    } catch (error) {
      console.error("[v0] Error fetching patient data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getInitials = (name) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading patient information...</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Patient not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-sky-500 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/staff/patients")}
              className="text-white hover:bg-white/20 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Patient Records
            </Button>
            <span className="text-sm">Home &gt; Patient Records &gt; Patient Details</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Patient Information</h1>

        {/* Patient Information Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 rounded-lg bg-sky-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {getInitials(patient.fullName)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{patient.fullName}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{patient.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{patient.age} years old</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Droplet className="w-4 h-4" />
                  <span>Blood Type: {patient.bloodType}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>DOB: {patient.dateOfBirth}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Phone className="w-5 h-5 text-sky-500" />
                Contact Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Address</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-500" />
                Emergency Contact
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Contact Name</p>
                    <p className="font-medium">{patient.emergencyContact}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Contact Number</p>
                    <p className="font-medium">{patient.emergencyPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Appointment History */}
        <Card className="p-6">
          <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sky-500" />
            Appointment History ({appointments.length})
          </h3>

          {appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No appointment history</p>
              <p className="text-sm mt-2">This patient has not made any appointments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((appointment) => (
                  <Card key={appointment.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">Appointment #{appointment.id}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{appointment.appointmentDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{appointment.appointmentTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{appointment.patientName}</span>
                          </div>
                        </div>
                        {appointment.reason && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Reason:</span> {appointment.reason}
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          Created: {new Date(appointment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
