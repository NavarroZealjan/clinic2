"use client"
import { ArrowLeft, Calendar, User, Cake } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ConsultationHistoryPage() {
  const router = useRouter()
  const [consultations, setConsultations] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchConsultations()
    const interval = setInterval(fetchConsultations, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchConsultations = async () => {
    try {
      const response = await fetch("/api/consultations")
      const data = await response.json()
      setConsultations(data)
    } catch (err) {
      setError(err)
    }
  }

  if (error) return <div>Failed to load consultations</div>
  if (!consultations) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Header */}
      <div className="bg-[#00A8E8] text-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/staff/dashboard")}
            className="text-white hover:bg-white/20 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span className="text-sm">Home &gt; Consultation History</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Consultation History</h1>
          <p className="text-gray-600 mt-1">Complete medical consultation records and treatment history</p>
        </div>

        {/* Consultation Records */}
        <div className="space-y-4">
          {consultations.map((consultation) => (
            <Card key={consultation.id} className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-semibold text-lg">
                        {new Date(consultation.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-sm text-gray-600">{consultation.time}</div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {consultation.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 border-l pl-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{consultation.patientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Cake className="h-4 w-4" />
                      <span>DOB: {consultation.patientDOB}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Dr. {consultation.doctorName}</span>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Diagnosis</h3>
                </div>
                <ul className="ml-7 list-disc list-inside">
                  <li className="text-gray-700">{consultation.diagnosis}</li>
                </ul>
              </div>

              {/* Symptoms */}
              <div className="mb-4 ml-7">
                <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {consultation.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline" className="font-normal">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Treatment & Prescription */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  <h3 className="font-semibold text-gray-900">Treatment & Prescription</h3>
                </div>
                <p className="ml-7 text-gray-700">{consultation.treatment}</p>
              </div>

              {/* Clinical Notes */}
              <div className="mb-4 ml-7">
                <h4 className="font-medium text-gray-900 mb-2">Clinical Notes</h4>
                <p className="text-gray-700">{consultation.clinicalNotes}</p>
              </div>

              {/* Follow-up */}
              <div className="ml-7 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Follow-up</span>
                  <Badge variant="outline">{consultation.followUp}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
