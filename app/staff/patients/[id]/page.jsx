"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Droplet,
  Users,
  FileText,
  FlaskConical,
  StickyNote,
} from "lucide-react"

export default function StaffPatientDetailPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("information")
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [medicalHistory, setMedicalHistory] = useState([])
  const [labResults, setLabResults] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatientData()
  }, [id])

  const fetchPatientData = async () => {
    try {
      const patientResponse = await fetch(`/api/patients/${id}`)
      if (patientResponse.ok) {
        const patientData = await patientResponse.json()
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
        setMedicalHistory(patientData.medical_history || [])
        setLabResults(patientData.lab_results || [])
        setNotes(patientData.notes || [])
      }

      // Fetch appointment history from database
      const appointmentsResponse = await fetch(`/api/patients/${id}/appointments`)
      if (appointmentsResponse.ok) {
        const data = await appointmentsResponse.json()
        setAppointments(data.appointments || [])
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
      case "completed":
        return "bg-green-100 text-green-700"
      case "scheduled":
        return "bg-blue-100 text-blue-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      case "no-show":
        return "bg-gray-100 text-gray-700"
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

        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={activeTab === "information" ? "default" : "outline"}
            onClick={() => setActiveTab("information")}
            className={activeTab === "information" ? "bg-sky-500 hover:bg-sky-600" : ""}
          >
            Patient Information
          </Button>
          <Button
            variant={activeTab === "appointments" ? "default" : "outline"}
            onClick={() => setActiveTab("appointments")}
            className={activeTab === "appointments" ? "bg-sky-500 hover:bg-sky-600" : ""}
          >
            Appointment History
          </Button>
          <Button
            variant={activeTab === "medical" ? "default" : "outline"}
            onClick={() => setActiveTab("medical")}
            className={activeTab === "medical" ? "bg-sky-500 hover:bg-sky-600" : ""}
          >
            <FileText className="w-4 h-4 mr-1" />
            Medical History
          </Button>
          <Button
            variant={activeTab === "labs" ? "default" : "outline"}
            onClick={() => setActiveTab("labs")}
            className={activeTab === "labs" ? "bg-sky-500 hover:bg-sky-600" : ""}
          >
            <FlaskConical className="w-4 h-4 mr-1" />
            Lab Results
          </Button>
          <Button
            variant={activeTab === "notes" ? "default" : "outline"}
            onClick={() => setActiveTab("notes")}
            className={activeTab === "notes" ? "bg-sky-500 hover:bg-sky-600" : ""}
          >
            <StickyNote className="w-4 h-4 mr-1" />
            Doctor's Notes
          </Button>
        </div>

        {activeTab === "information" && (
          <Card className="p-6">
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
        )}

        {activeTab === "appointments" && (
          <Card className="p-6">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-sky-500" />
              Appointment History ({appointments.length})
            </h3>

            {appointments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Calendar className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No appointment history</p>
                <p className="text-sm mt-2">This patient has not had any consultations yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment, index) => (
                  <Card key={appointment.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">Visit #{appointments.length - index}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {new Date(appointment.appointment_date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{appointment.appointment_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{appointment.doctor_name || "Dr. Smith"}</span>
                          </div>
                        </div>
                        {appointment.consultation_type && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Type:</span> {appointment.consultation_type}
                          </div>
                        )}
                        {appointment.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {appointment.notes}
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          Recorded: {new Date(appointment.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === "medical" && (
          <Card className="p-6">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-sky-500" />
              Medical History ({medicalHistory.length})
            </h3>

            {medicalHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No medical history</p>
                <p className="text-sm mt-2">No consultation records found for this patient</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medicalHistory.map((record) => (
                  <Card key={record.id} className="p-4 border-l-4 border-l-sky-500">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-sm">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(record.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.diagnosis}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === "labs" && (
          <Card className="p-6">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-sky-500" />
              Lab Results ({labResults.length})
            </h3>

            {labResults.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FlaskConical className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No lab results</p>
                <p className="text-sm mt-2">No laboratory test results found for this patient</p>
              </div>
            ) : (
              <div className="space-y-4">
                {labResults.map((result) => (
                  <Card key={result.id} className="p-4 border-l-4 border-l-green-500">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-sm">
                          {new Date(result.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(result.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {result.file_name && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">File:</p>
                        <p className="text-sm text-gray-600">{result.file_name}</p>
                      </div>
                    )}
                    {result.file_url && (
                      <div className="mt-2">
                        <a
                          href={result.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-sky-600 hover:text-sky-700 underline"
                        >
                          View Lab Result
                        </a>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === "notes" && (
          <Card className="p-6">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <StickyNote className="w-6 h-6 text-sky-500" />
              Doctor's Notes ({notes.length})
            </h3>

            {notes.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <StickyNote className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No doctor's notes</p>
                <p className="text-sm mt-2">No notes have been added for this patient</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id} className="p-4 border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(note.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
