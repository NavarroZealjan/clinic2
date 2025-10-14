import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Appointment Booked!</h1>
        <p className="text-slate-600 mb-8">
          Your appointment request has been submitted successfully. Our staff will review and confirm your appointment
          shortly.
        </p>
        <Link href="/">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">Return to Home</Button>
        </Link>
      </div>
    </div>
  )
}
