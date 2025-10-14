export default function StatCard({ title, value, icon, trend, trendUp, label, color }) {
  // Support old API with color-based styling
  if (color) {
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

  // New API with icon and trend
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-cyan-100 rounded-lg text-cyan-600">{icon}</div>
        {trend && (
          <span className={`text-sm font-medium ${trendUp ? "text-emerald-600" : "text-slate-500"}`}>{trend}</span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-600">{title}</div>
    </div>
  )
}

export { StatCard }
