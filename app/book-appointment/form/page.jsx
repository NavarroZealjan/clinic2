"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function PatientFormPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [availableSlots, setAvailableSlots] = useState([])
  const [slotAvailability, setSlotAvailability] = useState({})
  const [checkingSlot, setCheckingSlot] = useState(false)

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
    paymentMethod: "",
    paymentNumber: "",
    paymentNumberName: "",
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots()
    }
  }, [selectedDate])

  useEffect(() => {
    if (selectedDoctor && selectedDate && availableSlots.length > 0) {
      checkAllSlotsAvailability()
    }
  }, [selectedDoctor, selectedDate, availableSlots])

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors")
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching doctors:", error)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      if (hour < 17) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`)
      }
    }
    setAvailableSlots(slots)
  }

  const checkAllSlotsAvailability = async () => {
    if (!selectedDoctor || !selectedDate) return

    const doctorName = doctors.find((d) => d.id.toString() === selectedDoctor)?.full_name

    const availabilityPromises = availableSlots.map(async (slot) => {
      try {
        const response = await fetch("/api/appointments/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorName,
            appointmentDate: selectedDate,
            appointmentTime: slot,
          }),
        })
        const data = await response.json()
        return { slot, ...data }
      } catch (error) {
        return { slot, available: true, currentCount: 0, maxAllowed: 3 }
      }
    })

    const results = await Promise.all(availabilityPromises)
    const availabilityMap = {}
    results.forEach((result) => {
      availabilityMap[result.slot] = result
    })
    setSlotAvailability(availabilityMap)
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenderChange = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDoctor) {
      alert("Please select a doctor")
      return
    }
    if (!selectedDate) {
      alert("Please select an appointment date")
      return
    }
    if (!selectedTime) {
      alert("Please select an appointment time")
      return
    }

    setLoading(true)

    try {
      const patientData = {
        fullName: formData.fullName,
        email: formData.email,
        address: formData.address,
        dob: formData.dateOfBirth, // Convert dateOfBirth to dob for database
        bloodType: formData.bloodType,
        contactNumber: formData.contactNumber,
        gender: formData.gender,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactNumber: formData.emergencyContactNumber,
        paymentMethod: formData.paymentMethod,
        paymentNumber: formData.paymentNumber,
        paymentNumberName: formData.paymentNumberName,
      }

      console.log("[v0] Creating patient record:", patientData)

      const patientResponse = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      })

      if (!patientResponse.ok) {
        console.error("[v0] Failed to create patient:", patientResponse.status)
        alert("Failed to create patient record. Please try again.")
        setLoading(false)
        return
      }

      const newPatient = await patientResponse.json()
      console.log("[v0] Patient created successfully:", newPatient)

      const appointmentData = {
        fullName: formData.fullName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        dateOfBirth: formData.dateOfBirth,
        bloodType: formData.bloodType,
        gender: formData.gender,
        address: formData.address,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactNumber: formData.emergencyContactNumber,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        doctorName: doctors.find((d) => d.id.toString() === selectedDoctor)?.full_name || "Dr. Smith",
        patientId: newPatient.patient?.id || newPatient.id, // Link to patient record
      }

      console.log("[v0] Creating appointment:", appointmentData)

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      })

      if (response.status === 409) {
        const error = await response.json()
        alert(`Unable to book: ${error.reason}`)
        await checkAllSlotsAvailability()
        setLoading(false)
        return
      }

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

  const getSlotButtonClass = (slot) => {
    const availability = slotAvailability[slot]
    const isSelected = selectedTime === slot

    if (isSelected) {
      return "bg-cyan-500 text-white border-cyan-500"
    }

    if (!availability) {
      return "bg-white text-slate-700 border-slate-300 hover:border-cyan-500"
    }

    if (!availability.available) {
      return "bg-red-50 text-red-400 border-red-200 cursor-not-allowed"
    }

    if (availability.currentCount >= availability.maxAllowed * 0.8) {
      return "bg-yellow-50 text-yellow-700 border-yellow-300 hover:border-yellow-500"
    }

    return "bg-white text-slate-700 border-slate-300 hover:border-cyan-500"
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
              <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="doctor">Select Doctor</Label>
                  <select
                    id="doctor"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    required
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="appointmentDate">Appointment Date</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Select Time Slot</Label>
                  {selectedDate ? (
                    <>
                      <div className="flex gap-4 text-xs text-slate-600 mb-2 mt-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-white border border-slate-300 rounded"></div>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-50 border border-yellow-300 rounded"></div>
                          <span>Limited</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                          <span>Full</span>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-4 md:grid-cols-6 gap-2">
                        {availableSlots.map((slot) => {
                          const availability = slotAvailability[slot]
                          const isAvailable = !availability || availability.available
                          return (
                            <div key={slot} className="relative">
                              <button
                                type="button"
                                onClick={() => isAvailable && setSelectedTime(slot)}
                                disabled={!isAvailable}
                                className={`w-full px-3 py-2 rounded-md border text-sm font-medium transition-colors ${getSlotButtonClass(slot)}`}
                              >
                                {slot}
                              </button>
                              {availability && (
                                <div className="text-xs text-center mt-1 text-slate-500">
                                  {availability.currentCount}/{availability.maxAllowed}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">Please select a date first</p>
                  )}
                </div>
              </div>
            </div>

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

            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <p className="text-gray-600 text-sm mb-4">Please provide your preferred payment method for automatic billing</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select payment method</option>
                    <option value="GCash">GCash</option>
                    <option value="Maya">Maya</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="paymentNumber">Payment Number/Account</Label>
                  <Input
                    id="paymentNumber"
                    name="paymentNumber"
                    value={formData.paymentNumber}
                    onChange={handleChange}
                    placeholder="e.g., 09123456789 or Account Number"
                    required
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="paymentNumberName">Account Holder Name</Label>
                  <Input
                    id="paymentNumberName"
                    name="paymentNumberName"
                    value={formData.paymentNumberName}
                    onChange={handleChange}
                    placeholder="Name on the payment account"
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
