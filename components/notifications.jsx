import { Calendar, Users, User } from "lucide-react"

const notifications = [
  {
    id: 1,
    icon: Calendar,
    text: "3 Appointments pending approval",
    time: "8 mins ago",
    color: "red",
  },
  {
    id: 2,
    icon: Users,
    text: "2 doctors are available today",
    time: "1 hour ago",
    color: "green",
  },
  {
    id: 3,
    icon: User,
    text: "4 patients waiting for consultation",
    time: "18 mins ago",
    color: "blue",
  },
]

export function Notifications() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {notifications.map((notification) => {
          const Icon = notification.icon
          return (
            <div
              key={notification.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor:
                      notification.color === "red"
                        ? "var(--notification-red)"
                        : notification.color === "green"
                          ? "var(--activity-green)"
                          : "var(--activity-blue)",
                  }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">{notification.text}</span>
              </div>
              <span className="text-sm text-gray-500">{notification.time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
