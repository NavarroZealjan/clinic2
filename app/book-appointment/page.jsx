import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BookAppointmentPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2QOM8N71nwLkZittWL1pEgMwa9872C.png"
        alt="Doctor with patient"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
        <div className="max-w-2xl px-12 md:px-20">
          <div className="flex items-center gap-3 mb-8">
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
            <h1 className="text-3xl font-bold text-white">E-CLINIC</h1>
          </div>
          <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
            One click today,
            <br />
            better health tomorrow.
          </h2>
          <p className="text-xl text-white/90 mb-8">Fast Access to the care you need</p>
          <Link href="/book-appointment/form">
            <Button
              size="lg"
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all uppercase font-semibold"
            >
              BOOK AN APPOINTMENT
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
