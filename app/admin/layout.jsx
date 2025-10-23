"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({ children }) {
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem("user")

    if (!userStr) {
      console.log("[v0] No user in localStorage, redirecting to login")
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(userStr)
      console.log("[v0] Admin layout - User from localStorage:", user)

      if (user.role !== "admin") {
        console.log("[v0] User is not admin, redirecting to login")
        router.push("/login")
      }
    } catch (error) {
      console.error("[v0] Error parsing user from localStorage:", error)
      router.push("/login")
    }
  }, [router])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
