"use client"

import { useAuth } from "@/contexts/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DoctorLayout({ children }) {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "doctor") {
      router.push("/login")
    }
  }, [user, router])

  if (!user || user.role !== "doctor") {
    return null
  }

  return <>{children}</>
}
