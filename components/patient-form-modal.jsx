"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function PatientFormModal({ open, onOpenChange }) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenderChange = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log("[v0] Patient form submitted:", formData)

    // TODO: Add your database submission logic here
    // Example: await fetch('/api/patients', { method: 'POST', body: JSON.stringify(formData) })

    // Show success message (you can add toast notification here)
    alert("Patient information submitted successfully!")

    // Reset form and close modal
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
    })
    onOpenChange(false)
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
            <DialogTitle className="text-2xl font-bold">E-CLINIC</DialogTitle>
          </div>
          <p className="text-sm text-gray-600">
            Patient details are required for your medical record. Please fill in all the details below.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
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
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
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
                  required
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
                  required
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
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              className="px-12 py-6 text-white font-medium text-base"
              style={{ backgroundColor: "var(--stat-green)" }}
            >
              Submit and continue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
