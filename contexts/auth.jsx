"use client"

import { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const router = useRouter()

  const login = async (username, password) => {
    try {
      console.log("[v0] Sending login request for:", username)
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()
      console.log("[v0] API response:", data)

      if (!res.ok) {
        alert(data.error || "Login failed")
        return
      }

      setUser(data.user)
      console.log("[v0] User logged in:", data.user)

      if (data.user.role === "doctor") {
        console.log("[v0] Redirecting to doctor dashboard")
        router.push("/doctor/dashboard")
      } else if (data.user.role === "staff") {
        console.log("[v0] Redirecting to staff dashboard")
        router.push("/staff/dashboard")
      } else if (data.user.role === "admin") {
        console.log("[v0] Redirecting to admin dashboard")
        router.push("/staff/dashboard") // or /admin/dashboard if you have one
      } else {
        console.log("[v0] Unknown role, redirecting to staff dashboard")
        router.push("/staff/dashboard")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      alert("Something went wrong. Check console for details.")
    }
  }

  const logout = () => {
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
