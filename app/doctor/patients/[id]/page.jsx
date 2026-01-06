"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, TestTube, X, ArrowLeft, Printer, Plus } from "lucide-react"
import { PrescriptionPrint } from "@/components/prescription-print"

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
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [medicalHistories, setMedicalHistories] = useState([])
  const [labResults, setLabResults] = useState([])
  const [notes, setNotes] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
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
  const [newPrescription, setNewPrescription] = useState({
    doctorName: "",
    date: new Date().toISOString().split("T")[0],
    diagnosis: "",
    notes: "",
    medications: [
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ],
  })
  const [printPrescription, setPrintPrescription] = useState(null)

  useEffect(() => {
    fetchPatient()
    fetchMedicalRecords()
    fetchPrescriptions()
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

  const fetchMedicalRecords = async () => {
    try {
      console.log("[v0] Fetching medical records for patient ID:", id)
      const response = await fetch(`/api/patients/${id}`)
      console.log("[v0] Fetch response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Received patient data:", data)

        const transformedHistory = (data.medical_history || []).map((record) => ({
          id: record.id,
          date: record.date,
          diagnosis: record.diagnosis,
          createdAt: new Date(record.created_at).toLocaleString(),
        }))
        console.log("[v0] Transformed medical history:", transformedHistory)
        setMedicalHistories(transformedHistory)

        const transformedLabResults = (data.lab_results || []).map((result) => ({
          id: result.id,
          date: result.date,
          fileName: result.file_name || "No file",
          fileUrl: result.file_url,
          createdAt: new Date(result.created_at).toLocaleString(),
        }))
        console.log("[v0] Transformed lab results:", transformedLabResults)
        setLabResults(transformedLabResults)

        const transformedNotes = (data.notes || []).map((note) => ({
          id: note.id,
          content: note.content,
          createdAt: new Date(note.created_at).toLocaleString(),
        }))
        console.log("[v0] Transformed notes:", transformedNotes)
        setNotes(transformedNotes)
      } else {
        console.error("[v0] Failed to fetch medical records, status:", response.status)
      }
    } catch (error) {
      console.error("[v0] Error fetching medical records:", error)
    }
  }

  const fetchPrescriptions = async () => {
    try {
      console.log("[v0] Fetching prescriptions for patient ID:", id)
      const response = await fetch(`/api/patients/${id}/prescriptions`)
      console.log("[v0] Prescriptions response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Prescriptions data:", data)
        setPrescriptions(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching prescriptions:", error)
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

  const handleAddMedicalHistory = async () => {
    console.log("[v0] === SAVE MEDICAL HISTORY CLICKED ===")

    if (!newMedicalHistory.diagnosis.trim()) {
      alert("⚠️ Please enter a diagnosis before saving")
      return
    }

    try {
      console.log("[v0] Sending POST request to save medical history")
      console.log("[v0] Patient ID:", id)
      console.log("[v0] Data:", { date: newMedicalHistory.date, diagnosis: newMedicalHistory.diagnosis })

      const response = await fetch(`/api/patients/${id}/medical-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newMedicalHistory.date,
          diagnosis: newMedicalHistory.diagnosis,
        }),
      })

      console.log("[v0] Response status:", response.status)

      if (response.ok) {
        const savedRecord = await response.json()
        console.log("[v0] Successfully saved:", savedRecord)

        setMedicalHistories([
          ...medicalHistories,
          {
            id: savedRecord.id,
            date: savedRecord.date,
            diagnosis: savedRecord.diagnosis,
            createdAt: new Date(savedRecord.created_at).toLocaleString(),
          },
        ])

        setNewMedicalHistory({
          date: new Date().toISOString().split("T")[0],
          diagnosis: "",
        })
        setShowMedicalHistoryModal(false)
        alert("✅ Medical history saved successfully!")
      } else {
        const errorText = await response.text()
        console.error("[v0] Save failed:", errorText)
        alert("❌ Failed to save: " + errorText)
      }
    } catch (error) {
      console.error("[v0] Error:", error)
      alert("❌ Error: " + error.message)
    }
  }

  const handleAddLabResult = async () => {
    if (newLabResult.fileName) {
      try {
        console.log("[v0] Saving lab result:", newLabResult)
        const response = await fetch(`/api/patients/${id}/lab-results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: newLabResult.date,
            fileName: newLabResult.fileName,
            fileUrl: null,
          }),
        })

        console.log("[v0] Save response status:", response.status)

        if (response.ok) {
          const savedResult = await response.json()
          console.log("[v0] Saved lab result:", savedResult)
          setLabResults([
            ...labResults,
            {
              id: savedResult.id,
              date: savedResult.date,
              fileName: savedResult.file_name,
              fileUrl: savedResult.file_url,
              createdAt: new Date(savedResult.created_at).toLocaleString(),
            },
          ])
          setNewLabResult({
            date: new Date().toISOString().split("T")[0],
            file: null,
            fileName: "",
          })
          setShowLabResultModal(false)
          alert("Lab result saved successfully!")
        } else {
          const errorData = await response.json()
          console.error("[v0] Failed to save lab result:", errorData)
          alert("Failed to save lab result: " + (errorData.error || "Unknown error"))
        }
      } catch (error) {
        console.error("[v0] Error saving lab result:", error)
        alert("Failed to save lab result: " + error.message)
      }
    }
  }

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        console.log("[v0] Saving note:", newNote)
        const response = await fetch(`/api/patients/${id}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newNote,
          }),
        })

        console.log("[v0] Save response status:", response.status)

        if (response.ok) {
          const savedNote = await response.json()
          console.log("[v0] Saved note:", savedNote)
          setNotes([
            ...notes,
            {
              id: savedNote.id,
              content: savedNote.content,
              createdAt: new Date(savedNote.created_at).toLocaleString(),
            },
          ])
          setNewNote("")
          setShowNotesModal(false)
          alert("Note saved successfully!")
        } else {
          const errorData = await response.json()
          console.error("[v0] Failed to save note:", errorData)
          alert("Failed to save note: " + (errorData.error || "Unknown error"))
        }
      } catch (error) {
        console.error("[v0] Error saving note:", error)
        alert("Failed to save note: " + error.message)
      }
    }
  }

  const handleAddPrescription = async () => {
    if (!newPrescription.doctorName.trim()) {
      alert("Please enter doctor name")
      return
    }

    const hasValidMedication = newPrescription.medications.some((med) => med.name.trim() && med.dosage.trim())

    if (!hasValidMedication) {
      alert("Please add at least one medication with name and dosage")
      return
    }

    try {
      console.log("[v0] Saving prescription:", newPrescription)
      const response = await fetch(`/api/patients/${id}/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrescription),
      })

      if (response.ok) {
        const savedPrescription = await response.json()
        console.log("[v0] Prescription saved:", savedPrescription)
        setPrescriptions([savedPrescription, ...prescriptions])
        setNewPrescription({
          doctorName: "",
          date: new Date().toISOString().split("T")[0],
          diagnosis: "",
          notes: "",
          medications: [
            {
              name: "",
              dosage: "",
              frequency: "",
              duration: "",
              instructions: "",
            },
          ],
        })
        setShowPrescriptionModal(false)
        alert("Prescription saved successfully!")
      } else {
        const errorData = await response.json()
        console.error("[v0] Failed to save prescription:", errorData)
        alert("Failed to save prescription: " + (errorData.error || "Unknown error"))
      }
    } catch (error) {
      console.error("[v0] Error saving prescription:", error)
      alert("Failed to save prescription: " + error.message)
    }
  }

  const handleDeleteMedicalHistory = async (historyId) => {
    try {
      const response = await fetch(`/api/patients/${id}/medical-history?entryId=${historyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMedicalHistories(medicalHistories.filter((h) => h.id !== historyId))
        alert("Medical history deleted successfully!")
      }
    } catch (error) {
      console.error("[v0] Error deleting medical history:", error)
      alert("Failed to delete medical history")
    }
  }

  const handleDeleteLabResult = async (resultId) => {
    try {
      const response = await fetch(`/api/patients/${id}/lab-results?entryId=${resultId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setLabResults(labResults.filter((r) => r.id !== resultId))
        alert("Lab result deleted successfully!")
      }
    } catch (error) {
      console.error("[v0] Error deleting lab result:", error)
      alert("Failed to delete lab result")
    }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(`/api/patients/${id}/notes?entryId=${noteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotes(notes.filter((n) => n.id !== noteId))
        alert("Note deleted successfully!")
      }
    } catch (error) {
      console.error("[v0] Error deleting note:", error)
      alert("Failed to delete note")
    }
  }

  const handleDeletePrescription = async (prescriptionId) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return

    try {
      const response = await fetch(`/api/patients/${id}/prescriptions?entryId=${prescriptionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPrescriptions(prescriptions.filter((p) => p.id !== prescriptionId))
        alert("Prescription deleted successfully!")
      }
    } catch (error) {
      console.error("[v0] Error deleting prescription:", error)
      alert("Failed to delete prescription")
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

  const handleAddMedication = () => {
    setNewPrescription({
      ...newPrescription,
      medications: [
        ...newPrescription.medications,
        {
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    })
  }

  const handleRemoveMedication = (index) => {
    const updatedMedications = newPrescription.medications.filter((_, i) => i !== index)
    setNewPrescription({
      ...newPrescription,
      medications: updatedMedications,
    })
  }

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...newPrescription.medications]
    updatedMedications[index][field] = value
    setNewPrescription({
      ...newPrescription,
      medications: updatedMedications,
    })
  }

  const handlePrintPrescription = (prescription) => {
    setPrintPrescription(prescription)
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
              variant={activeTab === "prescriptions" ? "default" : "outline"}
              onClick={() => setActiveTab("prescriptions")}
              className={activeTab === "prescriptions" ? "bg-sky-500 hover:bg-sky-600" : ""}
            >
              Prescriptions
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
                          <div>
                            <p className="text-sm font-medium">Consultation Date: {history.date}</p>
                            <p className="text-xs text-gray-500">Added: {history.createdAt}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteMedicalHistory(history.id)}>
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
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteLabResult(result.id)}>
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

          {activeTab === "prescriptions" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Prescriptions ({prescriptions.length})</h3>
                <Button onClick={() => setShowPrescriptionModal(true)} className="bg-sky-500 hover:bg-sky-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Prescription
                </Button>
              </div>

              {prescriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FileText className="w-16 h-16 mb-3" />
                  <p className="font-medium">No Prescriptions</p>
                  <p className="text-sm mt-2">No prescriptions have been added for this patient</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <Card key={prescription.id} className="p-4 border-2">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-lg">Rx #{prescription.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(prescription.date).toLocaleDateString()} • Dr. {prescription.doctor_name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handlePrintPrescription(prescription)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Printer className="w-4 h-4 mr-1" />
                            Print
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeletePrescription(prescription.id)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {prescription.diagnosis && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-gray-700">Diagnosis:</p>
                          <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                        </div>
                      )}

                      <div className="mb-2">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Medications:</p>
                        <div className="space-y-2">
                          {prescription.medications.map((med, index) => (
                            <div key={index} className="pl-4 border-l-2 border-sky-500">
                              <p className="font-medium">
                                {index + 1}. {med.name} - {med.dosage}
                              </p>
                              <p className="text-sm text-gray-600">
                                {med.frequency} for {med.duration}
                              </p>
                              {med.instructions && <p className="text-xs text-gray-500 italic">{med.instructions}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {prescription.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-semibold text-gray-700">Notes:</p>
                          <p className="text-sm text-gray-600 italic">{prescription.notes}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
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
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
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
              Cancel
            </Button>
            <Button
              onClick={handleAddMedicalHistory}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6"
              size="lg"
            >
              💾 Save Medical History
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

      <Dialog open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Prescription</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Doctor Name *</label>
                <Input
                  value={newPrescription.doctorName}
                  onChange={(e) => setNewPrescription({ ...newPrescription, doctorName: e.target.value })}
                  placeholder="Enter doctor name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={newPrescription.date}
                  onChange={(e) => setNewPrescription({ ...newPrescription, date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Diagnosis</label>
              <Input
                value={newPrescription.diagnosis}
                onChange={(e) => setNewPrescription({ ...newPrescription, diagnosis: e.target.value })}
                placeholder="Enter diagnosis"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Medications *</label>
                <Button onClick={handleAddMedication} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medication
                </Button>
              </div>

              <div className="space-y-4">
                {newPrescription.medications.map((med, index) => (
                  <Card key={index} className="p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-semibold">Medication {index + 1}</p>
                      {newPrescription.medications.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMedication(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Medicine Name *</label>
                        <Input
                          value={med.name}
                          onChange={(e) => handleMedicationChange(index, "name", e.target.value)}
                          placeholder="e.g., Amoxicillin"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Dosage *</label>
                        <Input
                          value={med.dosage}
                          onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                          placeholder="e.g., 500mg"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Frequency</label>
                        <Input
                          value={med.frequency}
                          onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)}
                          placeholder="e.g., 3 times daily"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Duration</label>
                        <Input
                          value={med.duration}
                          onChange={(e) => handleMedicationChange(index, "duration", e.target.value)}
                          placeholder="e.g., 7 days"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-medium">Instructions</label>
                        <Input
                          value={med.instructions}
                          onChange={(e) => handleMedicationChange(index, "instructions", e.target.value)}
                          placeholder="e.g., Take after meals"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea
                value={newPrescription.notes}
                onChange={(e) => setNewPrescription({ ...newPrescription, notes: e.target.value })}
                placeholder="Enter additional notes or instructions"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowPrescriptionModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPrescription} className="bg-sky-500 hover:bg-sky-600">
                Save Prescription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {printPrescription && (
        <PrescriptionPrint
          prescription={printPrescription}
          patient={patient}
          onClose={() => setPrintPrescription(null)}
        />
      )}
    </div>
  )
}
