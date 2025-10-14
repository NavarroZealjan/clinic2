import { NextResponse } from "next/server";
import { getConsultations, addConsultation } from "@/lib/consultations-store";

export async function GET() {
  try {
    const consultations = getConsultations();
    return NextResponse.json(consultations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch consultations" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const newConsultation = addConsultation(data);
    return NextResponse.json(newConsultation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create consultation" },
      { status: 500 }
    );
  }
}
