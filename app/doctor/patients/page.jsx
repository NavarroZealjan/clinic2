"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PatientViewModal } from "@/components/patient-view-modal"
import { PatientEditModal } from "@/components/patient-edit-modal"
import { Pencil, Eye, Trash2 } from "lucide-react"

export default function PatientManagementPage() {
  const [patients, setPatients] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search,
      })

      const response = await fetch(`/api/patients?${params}`)
      const data = await response.json()

      setPatients(data.patients)
      setTotal(data.total)
    } catch (error) {
      console.error("[v0] Error fetching patients:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [page, limit, search])

  const handleView = (patient) => {
    setSelectedPatient(patient)
    setViewModalOpen(true)
  }

  const handleEdit = (patient) => {
    setSelectedPatient(patient)
    setEditModalOpen(true)
  }

  const handleDelete = async (patientId) => {
    if (!confirm("Are you sure you want to delete this patient?")) return

    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Patient deleted successfully")
        fetchPatients()
      } else {
        alert("Failed to delete patient")
      }
    } catch (error) {
      console.error("[v0] Error deleting patient:", error)
      alert("Error deleting patient")
    }
  }

  const calculateAge = (dob) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-gray-50">
        {/* Header */}
        <header className="h-14 flex items-center px-8 bg-sky-500">
          <div className="flex items-center gap-2 text-white text-sm">
            <span>Home</span>
            <span>&gt;</span>
            <span>Patient Management</span>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Title */}
            <div className="px-6 py-4 border-b">
              <h1 className="text-xl font-semibold">Patient Management</h1>
            </div>

            {/* Controls */}
            <div className="px-6 py-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value))
                    setPage(1)
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Search:</span>
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="w-64"
                  placeholder="Search by name or contact..."
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DOB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : patients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No patients found
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient, index) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">
                          {patient.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {calculateAge(patient.date_of_birth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(patient.date_of_birth).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.contact_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(patient.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEdit(patient)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleView(patient)}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDelete(patient.id)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button size="sm" className="bg-sky-500 text-white">
                  {page}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedPatient && (
        <>
          <PatientViewModal patient={selectedPatient} open={viewModalOpen} onOpenChange={setViewModalOpen} />
          <PatientEditModal
            patient={selectedPatient}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onSuccess={() => {
              fetchPatients()
              setEditModalOpen(false)
            }}
          />
        </>
      )}
    </div>
  )
}
