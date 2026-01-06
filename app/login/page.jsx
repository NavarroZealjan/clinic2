"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link";
import { Link2 } from "lucide-react";



export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await login(email.trim(), password.trim())

      if (result && result.success && result.user) {
        let redirectUrl = "/staff/dashboard" // default

        if (result.user.role === "doctor") {
          redirectUrl = "/doctor/dashboard"
        } else if (result.user.role === "admin") {
          redirectUrl = "/admin/dashboard"
        }

        setTimeout(() => {
          window.location.href = redirectUrl
        }, 100)
      } else {
        setError("Login failed. Please check your credentials.")
        setLoading(false)
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo and Title */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">MedCare Portal</h1>
            <p className="text-gray-600 mt-2">Sign in to access your medical dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            <div className="text-right">
           <Link
             href="/forgot-password" 
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
              </Link>
            </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          

          {/* Test Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">Test Credentials:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <strong>Doctor:</strong> dr.wison@clinic.com / doctor123
              </p>
              <p>
                <strong>Staff:</strong> staff1 / password123
              </p>
              <p>
                <strong></strong>
                
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
