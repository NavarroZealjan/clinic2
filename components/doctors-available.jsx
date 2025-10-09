const doctors = [
  { id: 1, name: "DR. WISON", status: "available" },
  { id: 2, name: "DR. SMITH", status: "available" },
  { id: 3, name: "DR. WALES", status: "unavailable" },
]

export function DoctorsAvailable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Doctors Available</h2>

      <div className="space-y-3">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="px-4 py-3 rounded-lg text-center font-semibold text-white text-sm"
            style={{
              backgroundColor: doctor.status === "available" ? "var(--stat-green)" : "var(--stat-coral)",
            }}
          >
            {doctor.name}
          </div>
        ))}
      </div>
    </div>
  )
}
