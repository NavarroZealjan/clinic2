import { Button } from "@/components/ui/button"

export function PatientWalkIn() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient walk-in</h2>
      <Button className="w-full text-white font-medium" style={{ backgroundColor: "var(--stat-blue)" }}>
        Add Patient
      </Button>
    </div>
  )
}
