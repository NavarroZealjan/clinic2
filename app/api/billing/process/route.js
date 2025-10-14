import { NextResponse } from "next/server";
import { billingStore } from "@/lib/billing-store";

export async function POST(request) {
  try {
    const body = await request.json();
    const { billingId, paymentMethod } = body;

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate payment success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      // Generate reference number
      const referenceNumber =
        Math.floor(Math.random() * 9000000000000) + 1000000000000;

      // Update billing record
      const record = await billingStore.update(billingId, {
        status: "completed",
        referenceNumber: referenceNumber.toString(),
      });

      return NextResponse.json({
        success: true,
        referenceNumber: referenceNumber.toString(),
        record,
      });
    } else {
      // Update billing record as failed
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
