"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, X, Loader2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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
  const [amount] = useState(500)
  const [step, setStep] = useState("select") // select, confirm, processing, success, failed
  const [billingId, setBillingId] = useState(null)
  const [referenceNo, setReferenceNo] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")

  const selectedPaymentMethod = paymentMethods.find((m) => m.id === selectedMethod)

  const handlePay = async () => {
    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentMethod: selectedPaymentMethod.name,
          patientName: "Walk-in Patient",
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

  const handleConfirmPayment = async () => {
    setStep("processing")

    try {
      const response = await fetch("/api/billing/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingId,
          paymentMethod: selectedPaymentMethod.name,
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
  }

  const handleDone = () => {
    setStep("select")
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
            <div className="space-y-3 mb-6">
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
    </div>
  )
}
