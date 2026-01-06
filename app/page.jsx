import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChatbotWidget } from "@/components/chatbot-widget"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-cyan-500 rounded-2xl flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-slate-900 mb-4">Welcome to E-CLINIC</h1>
        <p className="text-xl text-slate-600 mb-12">Your trusted healthcare management system</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Link href="/book-appointment">
            <Button size="lg" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-8 text-lg">
              Book Appointment
            </Button>
          </Link>
          <Link href="/my-appointments">
            <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-8 text-lg">
              My Appointments
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/staff/login">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50 py-8 text-lg bg-transparent"
            >
              Staff Login
            </Button>
          </Link>
          <Link href="/doctor/login">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50 py-8 text-lg bg-transparent"
            >
              Doctor Login
            </Button>
          </Link>
        </div>

        <ChatbotWidget />
      </div>
    </div>
  )
}
