"use client";

import { useAuth } from "../contexts/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setChecking(false);
    }
  }, [user, router]);

  if (checking) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  }

  return children;
}
