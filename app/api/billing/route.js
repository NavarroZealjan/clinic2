import { NextResponse } from "next/server";
import { billingStore } from "@/lib/billing-store";

export async function GET() {
  try {
    const records = await billingStore.getAll();
    return NextResponse.json(records);
  } catch (error) {
    console.error("[v0] Error fetching billing records:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch billing records",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, paymentMethod, patientName, appointmentId } = body;

    // Validate required fields
    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { error: "Amount and payment method are required" },
        { status: 400 }
      );
    }

    // Generate unique reference number
    const referenceNumber = `REF${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`;

    console.log("[v0] Creating billing record:", {
      amount,
      paymentMethod,
      patientName,
      referenceNumber,
    });

    // Create billing record
    const record = await billingStore.create({
      amount,
      paymentMethod,
      patientName: patientName || "Unknown",
      appointmentId: appointmentId || null,
      status: "pending",
      referenceNumber,
    });

    console.log("[v0] Billing record created successfully:", record);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("[v0] Error creating billing record:", error);
    return NextResponse.json(
      {
        error: "Failed to create billing record",
        details: error.message,
        hint: "Make sure the billing table exists. Run scripts/003_create_billing_table.sql",
      },
      { status: 500 }
    );
  }
}
