"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function PatientFormPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    dateOfBirth: "",
    bloodType: "",
    contactNumber: "",
    gender: "MALE",
    emergencyContactName: "",
    emergencyContactNumber: "",
  })

  const handleChange = (e) => {
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
      const now = new Date()
      const appointmentData = {
        ...formData,
        appointmentDate: now.toISOString().split("T")[0],
        appointmentTime: now.toTimeString().split(" ")[0].substring(0, 5),
      }

      console.log("[v0] Submitting appointment:", appointmentData)

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Appointment created successfully:", result)
        router.push("/book-appointment/success")
      } else {
        console.error("[v0] Failed to book appointment:", response.status)
        alert("Failed to book appointment. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error booking appointment:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">E-CLINIC</h1>
          </div>

          <p className="text-slate-600 mb-8">
            Patient details are required for your medical record. Please fill in all the details below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Input
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    placeholder="e.g., O+, A-, B+"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Gender</Label>
                  <RadioGroup value={formData.gender} onValueChange={handleGenderChange} className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2 border rounded-lg px-4 py-3">
                      <RadioGroupItem value="MALE" id="male" />
                      <Label htmlFor="male" className="cursor-pointer">
                        MALE
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg px-4 py-3">
                      <RadioGroupItem value="FEMALE" id="female" />
                      <Label htmlFor="female" className="cursor-pointer">
                        FEMALE
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactNumber">Contact Number</Label>
                  <Input
                    id="emergencyContactNumber"
                    name="emergencyContactNumber"
                    type="tel"
                    value={formData.emergencyContactNumber}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-6 text-lg rounded-lg"
              >
                {loading ? "Submitting..." : "Submit and continue"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
