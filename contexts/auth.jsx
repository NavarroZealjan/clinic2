"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const login = async (username, password) => {
    try {
      console.log("🔹 Sending login:", username);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("🔹 API response:", data);

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      // ✅ Login successful
      setUser(data.user);
      alert("✅ Login successful...");

      // Small delay to allow alert to show before navigation
      setTimeout(() => {
        if (data.user.role === "staff") {
          console.log("➡️ redirecting to /staff/dashboard");
          router.push("/staff/dashboard");
        } else {
          console.log("➡️ redirecting to /staff/dashboard (default)");
          router.push("/staff/dashboard");
        }
      }, 300);
    } catch (err) {
      console.error("❌ Login error:", err);
      alert("Something went wrong. Check console for details.");
    }
  };

  const logout = () => {
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
