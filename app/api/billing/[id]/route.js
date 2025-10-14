import { NextResponse } from "next/server";
import { billingStore } from "@/lib/billing-store";

export async function GET(request, { params }) {
  try {
    const record = await billingStore.getById(Number.parseInt(params.id));
    if (!record) {
      return NextResponse.json(
        { error: "Billing record not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(record);
  } catch (error) {
    console.error("[v0] Error fetching billing record:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing record" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const record = await billingStore.update(Number.parseInt(params.id), body);

    if (!record) {
      return NextResponse.json(
        { error: "Billing record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("[v0] Error updating billing record:", error);
    return NextResponse.json(
      { error: "Failed to update billing record" },
      { status: 500 }
    );
  }
}
