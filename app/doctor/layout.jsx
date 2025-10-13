"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DoctorLayout({ children }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem("user")
        console.log("[v0] Doctor layout - checking auth, user from localStorage:", userStr)

        if (userStr) {
          const user = JSON.parse(userStr)
          console.log("[v0] Doctor layout - parsed user:", user)

          if (user.role === "doctor") {
            console.log("[v0] Doctor layout - user authorized!")
            setIsAuthorized(true)
            setIsChecking(false)
            return
          }
        }

        console.log("[v0] Doctor layout - not authorized, redirecting to login")
        window.location.replace("/login")
      } catch (error) {
        console.error("[v0] Doctor layout - error checking auth:", error)
        window.location.replace("/login")
      }
    }

    checkAuth()
  }, [])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (isAuthorized) {
    return <>{children}</>
  }

  return null
}
