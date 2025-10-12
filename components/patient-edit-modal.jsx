"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function PatientEditModal({ patient, open, onOpenChange, onSuccess }) {
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
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (patient) {
      setFormData({
        fullName: patient.full_name || "",
        email: patient.email || "",
        address: patient.address || "",
        dateOfBirth: patient.date_of_birth ? patient.date_of_birth.split("T")[0] : "",
        bloodType: patient.blood_type || "",
        contactNumber: patient.contact_number || "",
        gender: patient.gender || "male",
        emergencyContactName: patient.emergency_contact_name || "",
        emergencyContactNumber: patient.emergency_contact_number || "",
      })
    }
  }, [patient])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenderChange = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/patients/${patient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Patient updated successfully!")
        onSuccess()
      } else {
        alert("Failed to update patient")
      }
    } catch (error) {
      console.error("[v0] Error updating patient:", error)
      alert("Error updating patient")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Patient Information</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
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
                  <div className="flex items-center space-x-2 border rounded-lg px-4 py-3 cursor-pointer">
                    <RadioGroupItem value="male" id="edit-male" />
                    <Label htmlFor="edit-male" className="cursor-pointer font-medium">
                      MALE
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg px-4 py-3 cursor-pointer">
                    <RadioGroupItem value="female" id="edit-female" />
                    <Label htmlFor="edit-female" className="cursor-pointer font-medium">
                      FEMALE
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
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

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
