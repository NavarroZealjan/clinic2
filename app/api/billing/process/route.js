import { NextResponse } from "next/server";
import { billingStore } from "@/lib/billing-store";

export async function POST(request) {
  try {
    const body = await request.json();
    const { billingId, paymentMethod, gcashNumber } = body;

    const existingRecord = await billingStore.getById(billingId);

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Billing record not found" },
        { status: 404 }
      );
    }

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate payment success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      const updateData = {
        status: "completed",
        paymentMethod: paymentMethod,
      };

      if (gcashNumber && paymentMethod === "GCash") {
        updateData.notes = `GCash Number: ${gcashNumber}`;
      }

      const record = await billingStore.update(billingId, updateData);

      return NextResponse.json({
        success: true,
        referenceNo: existingRecord.referenceNo, // Return the original reference number
        record,
      });
    } else {
      await billingStore.update(billingId, {
        status: "failed",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Insufficient balance",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[v0] Error processing payment:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}
