"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function PatientFormModal({ open, onOpenChange, onPatientCreated }) {
  const [mode, setMode] = useState("search") // "search" or "new"
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searching, setSearching] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    dateOfBirth: "",
    bloodType: "",
    contactNumber: "",
    gender: "male",
    emergencyContactName: "",
    emergencyContactNumber: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    doctorName: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const searchPatients = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setSearching(true)
      try {
        const response = await fetch(`/api/patients/search?q=${encodeURIComponent(searchQuery)}`)
        if (response.ok) {
          const results = await response.json()
          setSearchResults(results)
        }
      } catch (error) {
        console.error("[v0] Error searching patients:", error)
      } finally {
        setSearching(false)
      }
    }

    const debounce = setTimeout(searchPatients, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  useEffect(() => {
    if (!open) {
      setMode("search")
      setSearchQuery("")
      setSearchResults([])
      setSelectedPatient(null)
      setFormData({
        fullName: "",
        email: "",
        address: "",
        dateOfBirth: "",
        bloodType: "",
        contactNumber: "",
        gender: "male",
        emergencyContactName: "",
        emergencyContactNumber: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
        doctorName: "",
      })
    }
  }, [open])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenderChange = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }))
  }

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient)
    setMode("existing")
    setFormData((prev) => ({
      ...prev,
      fullName: patient.full_name,
      email: patient.email || "",
      contactNumber: patient.contact_number || "",
    }))
  }

  const handleExistingPatientSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create appointment for existing patient
      const appointmentData = {
        fullName: selectedPatient.full_name,
        email: selectedPatient.email,
        contactNumber: selectedPatient.contact_number,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
        doctorName: formData.doctorName,
        patientId: selectedPatient.id, // Link to existing patient
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      })

      if (response.ok) {
        alert("Walk-in appointment created successfully!")
        if (onPatientCreated) onPatientCreated()
        onOpenChange(false)
      } else {
        alert("Failed to create appointment")
      }
    } catch (error) {
      console.error("[v0] Error creating appointment:", error)
      alert("Error creating appointment")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newPatient = await response.json()

        // Create appointment for new patient
        const appointmentData = {
          fullName: formData.fullName,
          email: formData.email,
          contactNumber: formData.contactNumber,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          reason: formData.reason,
          doctorName: formData.doctorName,
          patientId: newPatient.id,
        }

        await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appointmentData),
        })

        alert("Patient and appointment created successfully!")
        if (onPatientCreated) onPatientCreated()
        onOpenChange(false)
      } else {
        alert("Failed to submit patient information")
      }
    } catch (error) {
      console.error("[v0] Error submitting patient:", error)
      alert("Error submitting patient information")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--stat-blue)" }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <DialogTitle className="text-2xl font-bold">
              {mode === "search" ? "Add Walk-in Patient" : mode === "existing" ? "Create Appointment" : "New Patient"}
            </DialogTitle>
          </div>
          <p className="text-sm text-gray-600">
            {mode === "search"
              ? "Search for existing patient or create a new one"
              : mode === "existing"
                ? "Create appointment for returning patient"
                : "Patient details are required for your medical record"}
          </p>
        </DialogHeader>

        {mode === "search" && (
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="search">Search Patient</Label>
              <Input
                id="search"
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {searching && <p className="text-sm text-gray-500">Searching...</p>}

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <Label>Search Results</Label>
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="font-medium">{patient.full_name}</div>
                    <div className="text-sm text-gray-600">
                      {patient.contact_number} • {patient.email}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Last visit: {patient.lastVisit}</div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <p className="text-sm text-gray-500">No patients found</p>
            )}

            <div className="pt-4 border-t">
              <Button
                type="button"
                className="w-full"
                style={{ backgroundColor: "var(--stat-green)" }}
                onClick={() => setMode("new")}
              >
                Create New Patient
              </Button>
            </div>
          </div>
        )}

        {mode === "existing" && selectedPatient && (
          <form onSubmit={handleExistingPatientSubmit} className="space-y-6 mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-medium text-blue-900">{selectedPatient.full_name}</div>
              <div className="text-sm text-blue-700">
                {selectedPatient.contact_number} • {selectedPatient.email}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">Appointment Date</Label>
                  <Input
                    id="appointmentDate"
                    name="appointmentDate"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Appointment Time</Label>
                  <Input
                    id="appointmentTime"
                    name="appointmentTime"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor</Label>
                  <Input
                    id="doctorName"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    placeholder="Dr. Smith"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Input
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Checkup, Follow-up, etc."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button type="button" variant="outline" onClick={() => setMode("search")}>
                Back to Search
              </Button>
              <Button
                type="submit"
                className="px-12 text-white font-medium"
                style={{ backgroundColor: "var(--stat-green)" }}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Appointment"}
              </Button>
            </div>
          </form>
        )}

        {mode === "new" && (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Input
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    placeholder="e.g., A+, O-, B+"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Gender</Label>
                  <RadioGroup value={formData.gender} onValueChange={handleGenderChange} className="flex gap-4">
                    <div
                      className="flex items-center space-x-2 border rounded-lg px-4 py-3 cursor-pointer"
                      style={{
                        borderColor: formData.gender === "male" ? "var(--stat-green)" : "#e5e7eb",
                        backgroundColor: formData.gender === "male" ? "rgba(74, 222, 128, 0.1)" : "transparent",
                      }}
                    >
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="cursor-pointer font-medium">
                        MALE
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-2 border rounded-lg px-4 py-3 cursor-pointer"
                      style={{
                        borderColor: formData.gender === "female" ? "var(--stat-green)" : "#e5e7eb",
                        backgroundColor: formData.gender === "female" ? "rgba(74, 222, 128, 0.1)" : "transparent",
                      }}
                    >
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="cursor-pointer font-medium">
                        FEMALE
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactNumber">Contact Number</Label>
                  <Input
                    id="emergencyContactNumber"
                    name="emergencyContactNumber"
                    type="tel"
                    value={formData.emergencyContactNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">Appointment Date</Label>
                  <Input
                    id="appointmentDate"
                    name="appointmentDate"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Appointment Time</Label>
                  <Input
                    id="appointmentTime"
                    name="appointmentTime"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor</Label>
                  <Input
                    id="doctorName"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    placeholder="Dr. Smith"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Input
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Checkup, Follow-up, etc."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button type="button" variant="outline" onClick={() => setMode("search")}>
                Back to Search
              </Button>
              <Button
                type="submit"
                className="px-12 text-white font-medium"
                style={{ backgroundColor: "var(--stat-green)" }}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit and continue"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
