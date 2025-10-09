"use client";

import Link from "next/link";
import Sidebar from "../../../components/Sidebar";

export default function PatientsLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      <div className="ml-72 p-6">
        <div className="bg-blue-500 text-white p-4 rounded-t-md mb-4">
          <h2 className="text-lg">Patients</h2>
        </div>

        <div className="bg-white p-4 rounded shadow mb-4">
          <nav className="flex gap-4">
            <Link href="/staff/patients" className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">Patient Management</Link>
            <Link href="/staff/patients/records" className="px-3 py-2 rounded hover:bg-gray-100">Patient Records</Link>
            <Link href="/staff/patients/consultation" className="px-3 py-2 rounded hover:bg-gray-100">Consultation History</Link>
          </nav>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
