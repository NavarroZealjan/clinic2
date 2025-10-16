"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, TestTube, X, ArrowLeft } from "lucide-react"

export default function PatientDetailPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("information")
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPatient, setEditedPatient] = useState(null)

  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false)
  const [showLabResultModal, setShowLabResultModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [medicalHistories, setMedicalHistories] = useState([])
  const [labResults, setLabResults] = useState([])
  const [notes, setNotes] = useState([])
  const [newMedicalHistory, setNewMedicalHistory] = useState({
    date: new Date().toISOString().split("T")[0],
    diagnosis: "",
  })
  const [newLabResult, setNewLabResult] = useState({
    date: new Date().toISOString().split("T")[0],
    file: null,
    fileName: "",
  })
  const [newNote, setNewNote] = useState("")

  useEffect(() => {
    fetchPatient()
  }, [id])

  const fetchPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${id}`)
      if (response.ok) {
        const data = await response.json()
        const transformedData = {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          dateOfBirth: data.date_of_birth,
          age: calculateAge(data.date_of_birth),
          gender: data.gender,
          bloodType: data.blood_type,
          emergencyContact: data.emergency_contact_name,
          emergencyPhone: data.emergency_contact_number,
          dateCreated: new Date(data.created_at).toLocaleString(),
        }
        setPatient(transformedData)
        setEditedPatient(transformedData)
      }
    } catch (error) {
      console.error("[v0] Error fetching patient:", error)
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

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedPatient),
      })
      if (response.ok) {
        const updated = await response.json()
        setPatient(updated)
        setIsEditing(false)
      }
    } catch (error) {
      console.error("[v0] Error updating patient:", error)
    }
  }

  const handleAddMedicalHistory = () => {
    if (newMedicalHistory.diagnosis.trim()) {
      setMedicalHistories([
        ...medicalHistories,
        {
          id: Date.now(),
          ...newMedicalHistory,
          createdAt: new Date().toLocaleString(),
        },
      ])
      setNewMedicalHistory({
        date: new Date().toISOString().split("T")[0],
        diagnosis: "",
      })
      setShowMedicalHistoryModal(false)
    }
  }

  const handleAddLabResult = () => {
    if (newLabResult.fileName) {
      setLabResults([
        ...labResults,
        {
          id: Date.now(),
          ...newLabResult,
          createdAt: new Date().toLocaleString(),
        },
      ])
      setNewLabResult({
        date: new Date().toISOString().split("T")[0],
        file: null,
        fileName: "",
      })
      setShowLabResultModal(false)
    }
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([
        ...notes,
        {
          id: Date.now(),
          content: newNote,
          createdAt: new Date().toLocaleString(),
        },
      ])
      setNewNote("")
      setShowNotesModal(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewLabResult({
        ...newLabResult,
        file: file,
        fileName: file.name,
      })
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

  const getInitials = (name) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-sky-500 text-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/doctor/patients")}
            className="text-white hover:bg-white/20 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Patient Management
          </Button>
          <span className="text-sm">Home &gt; Patient Information</span>
        </div>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Patient Information</h1>

        <Card className="p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "information" ? "default" : "outline"}
              onClick={() => setActiveTab("information")}
              className={activeTab === "information" ? "bg-sky-500 hover:bg-sky-600" : ""}
            >
              Information
            </Button>
            <Button
              variant={activeTab === "medlab" ? "default" : "outline"}
              onClick={() => setActiveTab("medlab")}
              className={activeTab === "medlab" ? "bg-sky-500 hover:bg-sky-600" : ""}
            >
              Med & Lab
            </Button>
            <Button
              variant={activeTab === "notes" ? "default" : "outline"}
              onClick={() => setActiveTab("notes")}
              className={activeTab === "notes" ? "bg-sky-500 hover:bg-sky-600" : ""}
            >
              Notes
            </Button>
          </div>

          {/* Information Tab */}
          {activeTab === "information" && (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-green-500 flex items-center justify-center text-white text-xl font-bold">
                    {getInitials(patient.fullName)}
                  </div>
                  <h2 className="text-2xl font-semibold">{patient.fullName}</h2>
                </div>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Info
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-sky-500 hover:bg-sky-600">
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h3 className="font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium">{patient.age} years old</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      {isEditing ? (
                        <Input
                          value={editedPatient.gender}
                          onChange={(e) => setEditedPatient({ ...editedPatient, gender: e.target.value })}
                        />
                      ) : (
                        <p className="font-medium">{patient.gender}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editedPatient.dateOfBirth}
                          onChange={(e) => setEditedPatient({ ...editedPatient, dateOfBirth: e.target.value })}
                        />
                      ) : (
                        <p className="font-medium">{patient.dateOfBirth}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Blood Type</p>
                      {isEditing ? (
                        <Input
                          value={editedPatient.bloodType}
                          onChange={(e) => setEditedPatient({ ...editedPatient, bloodType: e.target.value })}
                        />
                      ) : (
                        <p className="font-medium">{patient.bloodType}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency Information */}
                <div>
                  <h3 className="font-semibold mb-4">Emergency Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Contact Name</p>
                      {isEditing ? (
                        <Input
                          value={editedPatient.emergencyContact}
                          onChange={(e) =>
                            setEditedPatient({
                              ...editedPatient,
                              emergencyContact: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="font-medium">{patient.emergencyContact}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Number</p>
                      {isEditing ? (
                        <Input
                          value={editedPatient.emergencyPhone}
                          onChange={(e) => setEditedPatient({ ...editedPatient, emergencyPhone: e.target.value })}
                        />
                      ) : (
                        <p className="font-medium">{patient.emergencyPhone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      {isEditing ? (
                        <Input
                          value={editedPatient.phone}
                          onChange={(e) => setEditedPatient({ ...editedPatient, phone: e.target.value })}
                        />
                      ) : (
                        <p className="font-medium">{patient.phone}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      {isEditing ? (
                        <Input
                          value={editedPatient.email}
                          onChange={(e) => setEditedPatient({ ...editedPatient, email: e.target.value })}
                        />
                      ) : (
                        <p className="font-medium">{patient.email}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      {isEditing ? (
                        <Input
                          value={editedPatient.address}
                          onChange={(e) => setEditedPatient({ ...editedPatient, address: e.target.value })}
                        />
                      ) : (
                        <p className="font-medium">{patient.address}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Record Information */}
                <div>
                  <h3 className="font-semibold mb-4">Record Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">{patient.dateCreated}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last updated</p>
                      <p className="font-medium">{patient.dateCreated}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "medlab" && (
            <div className="grid grid-cols-2 gap-6">
              {/* Medical History Section */}
              <Card className="p-6 border-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Medical History</h3>
                    <p className="text-sm text-gray-500">({medicalHistories.length} entries)</p>
                  </div>
                  <Button
                    onClick={() => setShowMedicalHistoryModal(true)}
                    className="bg-sky-500 hover:bg-sky-600"
                    size="sm"
                  >
                    + Add Entry
                  </Button>
                </div>

                {medicalHistories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FileText className="w-16 h-16 mb-3" />
                    <p className="font-medium">No Medical History</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medicalHistories.map((history) => (
                      <Card key={history.id} className="p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium">{history.date}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMedicalHistories(medicalHistories.filter((h) => h.id !== history.id))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-700">
                          <p className="font-medium mb-1">Diagnosis:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {history.diagnosis
                              .split("\n")
                              .filter((line) => line.trim())
                              .map((item, index) => (
                                <li key={index}>{item.trim()}</li>
                              ))}
                          </ul>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Added: {history.createdAt}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>

              {/* Lab Result Section */}
              <Card className="p-6 border-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Lab Result</h3>
                    <p className="text-sm text-gray-500">({labResults.length} entries)</p>
                  </div>
                  <Button onClick={() => setShowLabResultModal(true)} className="bg-sky-500 hover:bg-sky-600" size="sm">
                    + Add Entry
                  </Button>
                </div>

                {labResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <TestTube className="w-16 h-16 mb-3" />
                    <p className="font-medium">No Lab History</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {labResults.map((result) => (
                      <Card key={result.id} className="p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium">{result.date}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLabResults(labResults.filter((r) => r.id !== result.id))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700">File: {result.fileName}</p>
                        <p className="text-xs text-gray-500 mt-2">Added: {result.createdAt}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Notes</h3>
                <Button onClick={() => setShowNotesModal(true)} className="bg-sky-500 hover:bg-sky-600">
                  + Add Note
                </Button>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="font-medium">No notes available</p>
                  <p className="text-sm mt-2">Record a new note for the patient</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <Card key={note.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-gray-500">{note.createdAt}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={showMedicalHistoryModal} onOpenChange={setShowMedicalHistoryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Medical History</DialogTitle>
            <p className="text-sm text-gray-600">Record a new medical history for the patient</p>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Date: {newMedicalHistory.date}</label>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Diagnosis</label>
              <p className="text-xs text-gray-500 mb-2">Enter each diagnosis on a new line</p>
              <Textarea
                value={newMedicalHistory.diagnosis}
                onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, diagnosis: e.target.value })}
                placeholder="Enter diagnosis details...&#10;Example:&#10;Hypertension&#10;Type 2 Diabetes&#10;High Cholesterol"
                rows={6}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowMedicalHistoryModal(false)}>
              Close
            </Button>
            <Button onClick={handleAddMedicalHistory} className="bg-sky-500 hover:bg-sky-600">
              Add Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLabResultModal} onOpenChange={setShowLabResultModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Lab Result</DialogTitle>
            <p className="text-sm text-gray-600">Record a new lab result for the patient</p>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Date: {newLabResult.date}</label>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Add file</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="flex-1"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>
              {newLabResult.fileName && <p className="text-sm text-gray-600 mt-2">Selected: {newLabResult.fileName}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowLabResultModal(false)}>
              Close
            </Button>
            <Button onClick={handleAddLabResult} className="bg-sky-500 hover:bg-sky-600">
              Add Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Notes</DialogTitle>
            <p className="text-sm text-gray-600">Record a new notes for the patient</p>
          </DialogHeader>
          <div className="mt-4">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your notes here..."
              rows={8}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowNotesModal(false)}>
              Close
            </Button>
            <Button onClick={handleAddNote} className="bg-sky-500 hover:bg-sky-600">
              Add Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
