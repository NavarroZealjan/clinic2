"use client"

import { useAuth } from "@/contexts/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function StaffLayout({ children }) {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/login")
      return
    }

    // Check if user has staff role
    if (user.role !== "staff") {
      router.push("/login")
    }
  }, [user, router])

  // Don't render until auth is checked
  if (!user || user.role !== "staff") {
    return null
  }

  return <>{children}</>
}
