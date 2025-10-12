"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      console.log("[v0] Sending login request for:", username)
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[v0] Non-JSON response received:", res.status, res.statusText)
        const text = await res.text()
        console.error("[v0] Response text:", text)
        alert("Server error. Please check if the database is connected.")
        return { success: false }
      }

      const data = await res.json()
      console.log("[v0] API response:", data)

      if (!res.ok) {
        alert(data.error || "Login failed")
        return { success: false }
      }

      setUser(data.user)
      localStorage.setItem("user", JSON.stringify(data.user))
      console.log("[v0] User logged in:", data.user)

      return { success: true, user: data.user }
    } catch (err) {
      console.error("[v0] Login error:", err)
      alert("Something went wrong. Check console for details.")
      return { success: false }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
