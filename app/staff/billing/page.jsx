"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, X, Loader2, History, Smartphone, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const paymentMethods = [
  {
    id: "gcash",
    name: "GCash",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/GCash_logo.svg/512px-GCash_logo.svg.png",
    description: "Payment should be completed within 30 mins. Accessible 24/7",
    color: "#007DFF",
  },
  {
    id: "maya",
    name: "Maya",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Maya_%28payment_system%29_logo.svg/512px-Maya_%28payment_system%29_logo.svg.png",
    description: "Payment should be completed within 30 mins. Accessible 24/7",
    color: "#000000",
  },
  {
    id: "gonlinebank",
    name: "GOnlinebank",
    icon: "https://via.placeholder.com/48/00D9C0/ffffff?text=GO",
    description: "Payment should be completed within 30 mins. Accessible 24/7",
    color: "#00D9C0",
  },
]

export default function BillingPage() {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState("gcash")
  const [amount, setAmount] = useState(500)
  const [step, setStep] = useState("select")
  const [billingId, setBillingId] = useState(null)
  const [referenceNo, setReferenceNo] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [gcashNumber, setGcashNumber] = useState("")
  const [gcashError, setGcashError] = useState("")
  const [showGcashModal, setShowGcashModal] = useState(false)

  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientSearch, setPatientSearch] = useState("")
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)

  const selectedPaymentMethod = paymentMethods.find((m) => m.id === selectedMethod)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    setLoadingPatients(true)
    try {
      const response = await fetch("/api/patients?limit=100")
      if (!response.ok) throw new Error("Failed to fetch patients")
      const data = await response.json()
      setPatients(data.patients || [])
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setLoadingPatients(false)
    }
  }

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(patientSearch.toLowerCase()),
  )

  const validateGcashNumber = (number) => {
    const phoneRegex = /^(09|\+639|9)\d{9}$/
    return phoneRegex.test(number.replace(/[-\s]/g, ""))
  }

  const handlePay = async () => {
    if (!selectedPatient) {
      alert("Please select a patient")
      return
    }

    if (!amount || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentMethod: selectedPaymentMethod.name,
          patientName: selectedPatient.full_name, // Use selected patient's name
          gcashNumber: null,
        }),
      })

      if (!response.ok) throw new Error("Failed to create billing record")

      const record = await response.json()
      setBillingId(record.id)
      setStep("confirm")
    } catch (error) {
      console.error("Error creating billing record:", error)
      alert("Failed to initiate payment")
    }
  }

  const handleConfirmPayment = () => {
    if (selectedMethod === "gcash") {
      setShowGcashModal(true)
    } else {
      processPayment()
    }
  }

  const handleGcashSubmit = () => {
    if (!gcashNumber) {
      setGcashError("Please enter your GCash number")
      return
    }
    if (!validateGcashNumber(gcashNumber)) {
      setGcashError("Please enter a valid Philippine mobile number")
      return
    }
    setGcashError("")
    setShowGcashModal(false)
    setStep("gcash-pending")
  }

  const handleGcashApproved = () => {
    processPayment()
  }

  const handleCancelPayment = () => {
    setStep("confirm")
    setGcashNumber("")
  }

  const processPayment = async () => {
    setStep("processing")

    try {
      const response = await fetch("/api/billing/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingId,
          paymentMethod: selectedPaymentMethod.name,
          gcashNumber: selectedMethod === "gcash" ? gcashNumber : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setReferenceNo(data.referenceNo)
        setStep("success")
      } else {
        setErrorMessage(data.error || "Payment failed")
        setStep("failed")
      }
    } catch (error) {
      console.error("Payment processing error:", error)
      setErrorMessage("Payment processing failed")
      setStep("failed")
    }
  }

  const handleRetry = () => {
    setStep("confirm")
    setErrorMessage("")
  }

  const handleChangeMethod = () => {
    setStep("select")
    setErrorMessage("")
    setGcashNumber("")
    setGcashError("")
  }

  const handleDone = () => {
    setStep("select")
    setGcashNumber("")
    setGcashError("")
    setSelectedPatient(null)
    setAmount(500)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#0ea5e9] text-white px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/staff/dashboard")} className="hover:bg-white/10 p-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-sm">
          <span className="opacity-80">Home</span>
          <span className="mx-2">›</span>
          <span>
            {step === "select" && "Select Payment Method"}
            {step === "confirm" && "Confirm Payment"}
            {step === "gcash-pending" && "Waiting for GCash Approval"}
            {step === "processing" && "Processing Payment"}
            {step === "success" && "Payment Successful"}
            {step === "failed" && "Payment Failed"}
          </span>
        </div>
      </div>

      <div className="p-8">
        {/* Select Payment Method */}
        {step === "select" && (
          <Card className="max-w-md mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Billing</h2>
              <Button
                onClick={() => router.push("/staff/billing/history")}
                variant="outline"
                size="sm"
                className="bg-transparent gap-2"
              >
                <History className="w-4 h-4" />
                View History
              </Button>
            </div>

            <div className="space-y-4 mb-6 pb-6 border-b">
              <div className="space-y-2">
                <Label htmlFor="patient-select">Select Patient *</Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                  >
                    <span className={selectedPatient ? "text-gray-900" : "text-gray-500"}>
                      {selectedPatient ? selectedPatient.full_name : "Choose a patient"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {showPatientDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search patients..."
                            value={patientSearch}
                            onChange={(e) => setPatientSearch(e.target.value)}
                            className="pl-8"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {loadingPatients ? (
                          <div className="py-6 text-center text-sm text-gray-500">Loading patients...</div>
                        ) : filteredPatients.length === 0 ? (
                          <div className="py-6 text-center text-sm text-gray-500">No patients found</div>
                        ) : (
                          filteredPatients.map((patient) => (
                            <button
                              key={patient.id}
                              type="button"
                              onClick={() => {
                                setSelectedPatient(patient)
                                setShowPatientDropdown(false)
                                setPatientSearch("")
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{patient.full_name}</span>
                                <span className="text-xs text-gray-500">{patient.contact_number}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedPatient && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <div className="font-medium">{selectedPatient.full_name}</div>
                    <div className="text-xs">{selectedPatient.contact_number}</div>
                    {selectedPatient.email && <div className="text-xs">{selectedPatient.email}</div>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₱) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <Label>Payment Method</Label>
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? "border-[#0ea5e9] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="mt-1"
                  />
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: method.color }}
                  >
                    {method.name.substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{method.name}</div>
                    <div className="text-sm text-gray-600">{method.description}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="font-semibold">Total ₱{amount}</span>
              <Button onClick={handlePay} className="bg-emerald-500 hover:bg-emerald-600">
                Pay
              </Button>
            </div>
          </Card>
        )}

        {/* Confirm Payment */}
        {step === "confirm" && (
          <Card className="max-w-md mx-auto">
            <div className="bg-[#0ea5e9] text-white px-6 py-4 font-semibold">Confirm Payment</div>
            <div className="p-6 space-y-6">
              {selectedPatient && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="text-sm text-gray-600">Patient</div>
                  <div className="font-semibold">{selectedPatient.full_name}</div>
                  <div className="text-sm text-gray-600">{selectedPatient.contact_number}</div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: selectedPaymentMethod.color }}
                >
                  {selectedPaymentMethod.name.substring(0, 2)}
                </div>
                <span className="font-semibold">{selectedPaymentMethod.name}</span>
              </div>
              <div className="flex justify-between py-3 border-t border-b">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold">₱{amount}</span>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleChangeMethod} variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleConfirmPayment} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                  Confirm & Pay
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* GCash Pending Approval Screen */}
        {step === "gcash-pending" && (
          <Card className="max-w-md mx-auto">
            <div className="bg-[#007DFF] text-white px-6 py-4 font-semibold flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              GCash Payment Request
            </div>
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <Smartphone className="w-10 h-10 text-[#007DFF]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold">Payment Request Sent</h3>
                <p className="text-gray-600">Waiting for approval...</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold">₱{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GCash Number</span>
                  <span className="font-semibold">{gcashNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    PENDING
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-left space-y-2">
                <p className="font-semibold text-amber-800">📱 Please complete the following:</p>
                <ol className="list-decimal list-inside space-y-1 text-amber-700">
                  <li>Open your GCash mobile app</li>
                  <li>Check for the payment notification</li>
                  <li>Enter your MPIN to approve the payment</li>
                  <li>Return here and click "I've Approved"</li>
                </ol>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={handleGcashApproved} className="w-full bg-emerald-500 hover:bg-emerald-600" size="lg">
                  <Check className="w-5 h-5 mr-2" />
                  I've Approved in GCash App
                </Button>
                <Button onClick={handleCancelPayment} variant="outline" className="w-full bg-transparent">
                  Cancel Payment
                </Button>
              </div>

              <p className="text-xs text-gray-500">This request will expire in 5 minutes if not approved</p>
            </div>
          </Card>
        )}

        {/* Processing Payment */}
        {step === "processing" && (
          <Card className="max-w-md mx-auto">
            <div className="bg-[#0ea5e9] text-white px-6 py-4 font-semibold">Confirm Payment</div>
            <div className="p-12 text-center space-y-4">
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-[#0ea5e9]" />
              <p className="font-medium">Processing your payment, please wait...</p>
              <p className="text-sm text-gray-600">Do not close this window.</p>
            </div>
          </Card>
        )}

        {/* Payment Successful */}
        {step === "success" && (
          <Card className="max-w-md mx-auto">
            <div className="bg-[#0ea5e9] text-white px-6 py-4 font-semibold">Payment Successful</div>
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-emerald-600">Payment Successful!</h3>
              <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg">
                {selectedPatient && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="text-gray-600">Patient</span>
                    <span className="font-semibold">{selectedPatient.full_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference No.</span>
                  <span className="font-mono font-semibold">{referenceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold">₱{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-semibold">{selectedPaymentMethod.name}</span>
                </div>
                {selectedMethod === "gcash" && gcashNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">GCash Number</span>
                    <span className="font-semibold">{gcashNumber}</span>
                  </div>
                )}
              </div>
              <Button onClick={handleDone} className="w-full bg-emerald-500 hover:bg-emerald-600">
                Done
              </Button>
            </div>
          </Card>
        )}

        {/* Payment Failed */}
        {step === "failed" && (
          <Card className="max-w-md mx-auto">
            <div className="bg-[#0ea5e9] text-white px-6 py-4 font-semibold">Confirm Payment</div>
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-600 mb-2">Payment Failed</h3>
                <p className="text-gray-600">{errorMessage}</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleRetry} variant="outline" className="flex-1 bg-transparent">
                  Retry Payment
                </Button>
                <Button onClick={handleChangeMethod} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                  Change method
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* GCash Number Modal */}
      <Dialog open={showGcashModal} onOpenChange={setShowGcashModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter GCash Number</DialogTitle>
            <DialogDescription>
              Please enter your GCash registered mobile number to proceed with the payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gcash-modal-number">GCash Mobile Number</Label>
              <Input
                id="gcash-modal-number"
                type="tel"
                placeholder="09XX-XXX-XXXX"
                value={gcashNumber}
                onChange={(e) => {
                  setGcashNumber(e.target.value)
                  setGcashError("")
                }}
                className={gcashError ? "border-red-500" : ""}
                autoFocus
              />
              {gcashError && <p className="text-sm text-red-500">{gcashError}</p>}
              <p className="text-xs text-gray-500">Format: 09XX-XXX-XXXX or 09XXXXXXXXX</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowGcashModal(false)
                setGcashNumber("")
                setGcashError("")
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleGcashSubmit} className="bg-emerald-500 hover:bg-emerald-600">
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
