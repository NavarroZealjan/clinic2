"use client";

import ProtectedRoute from "../../../components/protected-route";
import { useAuth } from "../../../contexts/auth";
import { FaHome, FaUserFriends, FaCalendarAlt, FaClipboardList, FaFileAlt, FaMoneyBill } from "react-icons/fa";

export default function StaffDashboard() {
  const { user } = useAuth(); // get current logged-in user

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0B2D56] text-white p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-white text-[#0B2D56] font-bold p-2 rounded">E</div>
            <h1 className="text-lg font-bold">E-CLINIC</h1>
          </div>

          <nav className="flex-1">
            <a href="#" className="flex items-center gap-3 p-2 bg-blue-700 rounded mb-2">
              <FaHome /> Home
            </a>
            <div>
              <div className="flex items-center gap-3 p-2 hover:bg-blue-700 rounded">
                <FaUserFriends /> Patients
              </div>
              <div className="ml-8 text-sm text-gray-300">
                <p>Patient Management</p>
                <p>Patient Information</p>
                <p>Patient Records</p>
              </div>
            </div>
            <a href="#" className="flex items-center gap-3 p-2 hover:bg-blue-700 rounded mt-2">
              <FaCalendarAlt /> Appointment
            </a>
            <a href="#" className="flex items-center gap-3 p-2 hover:bg-blue-700 rounded mt-2">
              <FaClipboardList /> Consultation History
            </a>
            <a href="#" className="flex items-center gap-3 p-2 hover:bg-blue-700 rounded mt-2">
              <FaFileAlt /> Reports
            </a>
            <a href="#" className="flex items-center gap-3 p-2 hover:bg-blue-700 rounded mt-2">
              <FaMoneyBill /> Billing
            </a>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#0B2D56]">
              Welcome, {user?.username || "Staff"}
            </h2>
          </div>

          {/* the rest of your dashboard UI here */}
          {/* (same content as before — stats, activity, notifications) */}
        </main>
      </div>
    </ProtectedRoute>
  );
}
