import { NextResponse } from "next/server";
import { appointmentsStore, getStoreInfo } from "@/lib/appointments-store";

export async function GET() {
  const storeInfo = getStoreInfo();
  console.log("[v0] GET /api/appointments - Store info:", storeInfo);
  console.log("[v0] GET /api/appointments - Using global?", storeInfo.isGlobal);
  console.log(
    "[v0] GET /api/appointments - Appointments array:",
    appointmentsStore.appointments
  );
  return NextResponse.json(appointmentsStore.appointments);
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("[v0] POST /api/appointments - Received data:", data);

    const storeBefore = getStoreInfo();
    console.log("[v0] POST /api/appointments - Store before:", storeBefore);
    console.log(
      "[v0] POST /api/appointments - Using global?",
      storeBefore.isGlobal
    );

    const newAppointment = {
      id: appointmentsStore.nextId++,
      ...data,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    appointmentsStore.appointments.push(newAppointment);

    console.log("[v0] Appointment created successfully!");
    const storeAfter = getStoreInfo();
    console.log("[v0] POST /api/appointments - Store after:", storeAfter);
    console.log(
      "[v0] POST /api/appointments - Total appointments:",
      storeAfter.appointmentsCount
    );
    console.log("[v0] All appointments:", appointmentsStore.appointments);

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error("[v0] Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
