"use client"

import { useState } from "react"
import { PatientFormModal } from "@/components/patient-form-modal"

export function PatientWalkIn({ onPatientAdded }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePatientCreated = () => {
    if (onPatientAdded) {
      onPatientAdded()
    }
  }

  return (
    <>
      <button
        className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium py-3 px-4 rounded-lg transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        Add Patient
      </button>

      <PatientFormModal open={isModalOpen} onOpenChange={setIsModalOpen} onPatientCreated={handlePatientCreated} />
    </>
  )
}
