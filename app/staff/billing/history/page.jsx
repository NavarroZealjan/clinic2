"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TransactionHistoryPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
    const interval = setInterval(fetchTransactions, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/billing")
      if (response.ok) {
        const data = await response.json()
        const completed = data.filter((t) => t.status === "completed")
        setTransactions(completed)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#0ea5e9] text-white px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/staff/billing")} className="hover:bg-white/10 p-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-sm">
          <span className="opacity-80">Home</span>
          <span className="mx-2">›</span>
          <span className="opacity-80">Billing</span>
          <span className="mx-2">›</span>
          <span>Transaction History</span>
        </div>
      </div>

      <div className="p-8">
        <Card className="max-w-6xl mx-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <Button onClick={() => router.push("/staff/billing")} className="bg-[#0ea5e9] hover:bg-[#0284c7] gap-2">
                <Plus className="w-4 h-4" />
                New Payment
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <p>Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No transactions yet</p>
                <p className="text-sm mt-2">Your payment history will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Reference No.</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{transaction.referenceNo}</TableCell>
                        <TableCell>
                          {new Date(transaction.paidAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          {new Date(transaction.paidAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>{transaction.patientName}</TableCell>
                        <TableCell>{transaction.paymentMethod}</TableCell>
                        <TableCell className="font-semibold">₱{transaction.amount}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            {transaction.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
