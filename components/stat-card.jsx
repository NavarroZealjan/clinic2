export function StatCard({ value, label, color }) {
  const colorStyles = {
    blue: { backgroundColor: "var(--stat-blue)" },
    "light-blue": { backgroundColor: "var(--stat-light-blue)" },
    coral: { backgroundColor: "var(--stat-coral)" },
    green: { backgroundColor: "var(--stat-green)" },
  }

  return (
    <div className="rounded-xl p-6 text-white shadow-lg" style={colorStyles[color]}>
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-sm font-medium opacity-95">{label}</div>
    </div>
  )
}
