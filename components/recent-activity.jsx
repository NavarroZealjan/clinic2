import { User } from "lucide-react"

const activities = [
  {
    id: 1,
    text: "Zealjan booked an appointment",
    time: "2 mins ago",
    color: "green",
  },
  {
    id: 2,
    text: "Dr. Smith Approved an appointment",
    time: "1 hour ago",
    color: "blue",
  },
  {
    id: 3,
    text: "Admin add new patient",
    time: "10 mins ago",
    color: "purple",
  },
]

export function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor:
                    activity.color === "green"
                      ? "var(--activity-green)"
                      : activity.color === "blue"
                        ? "var(--activity-blue)"
                        : "var(--activity-purple)",
                }}
              >
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">{activity.text}</span>
            </div>
            <span className="text-sm text-gray-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
