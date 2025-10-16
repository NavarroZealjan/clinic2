"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, ArrowLeft } from "lucide-react"

export default function StaffPatientRecordsPage() {
  const [patients, setPatients] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search,
      })

      const response = await fetch(`/api/patients?${params}`)

      if (!response.ok) {
        console.error("[v0] API error:", response.status)
        setPatients([])
        setTotal(0)
        return
      }

      const data = await response.json()

      setPatients(data.patients || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error("[v0] Error fetching patients:", error)
      setPatients([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [page, limit, search])

  const handleView = (patient) => {
    router.push(`/staff/patients/${patient.id}`)
  }

  const handleEdit = (patient) => {
    router.push(`/staff/patients/${patient.id}?edit=true`)
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
    <main className="flex-1 bg-gray-50">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-8 bg-sky-500">
        <div className="flex items-center gap-2 text-white text-sm">
          <span>Home</span>
          <span>&gt;</span>
          <span>Patient Records</span>
        </div>
        <Button
          onClick={() => router.push("/staff")}
          className="bg-white text-sky-500 hover:bg-gray-100 flex items-center gap-2"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </header>

      {/* Content */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Title */}
          <div className="px-6 py-4 border-b">
            <h1 className="text-xl font-semibold">Patient Records</h1>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PATIENT NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GENDER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DOB
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CONTACT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATE CREATED
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{patient.gender}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(patient.date_of_birth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.contact_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(patient.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(patient)}
                            className="bg-cyan-400 hover:bg-cyan-500 text-white h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleView(patient)}
                            className="bg-blue-500 hover:bg-blue-600 text-white h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete(patient.id)}
                            className="bg-red-500 hover:bg-red-600 text-white h-8 w-8 p-0"
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
              Showing {patients.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total}{" "}
              entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-gray-600"
              >
                Previous
              </Button>
              <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                {page}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="text-gray-600"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
