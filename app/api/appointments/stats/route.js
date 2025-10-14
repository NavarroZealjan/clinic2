import { NextResponse } from "next/server";
import { appointmentsStore, getStoreInfo } from "@/lib/appointments-store";

export async function GET() {
  try {
    const storeInfo = getStoreInfo();
    console.log("[v0] Stats API - Store info:", storeInfo);
    console.log("[v0] Stats API - Using global?", storeInfo.isGlobal);
    console.log(
      "[v0] Stats API - Global store reference:",
      global.appointmentsStore
    );
    console.log(
      "[v0] Stats API - Appointments array:",
      appointmentsStore.appointments
    );

    const appointments = appointmentsStore.appointments;
    console.log("[v0] Stats API - Total appointments:", appointments.length);

    const today = new Date().toISOString().split("T")[0];

    const stats = {
      totalAppointments: appointments.length,
      pendingAppointments: appointments.filter(
        (apt) => apt.status === "pending"
      ).length,
      approvedAppointments: appointments.filter(
        (apt) => apt.status === "approved"
      ).length,
      todayPatients: appointments.filter(
        (apt) => apt.appointmentDate === today && apt.status === "approved"
      ).length,
    };

    console.log("[v0] Stats calculated:", stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[v0] Error calculating stats:", error);
    return NextResponse.json(
      {
        totalAppointments: 0,
        pendingAppointments: 0,
        approvedAppointments: 0,
        todayPatients: 0,
      },
      { status: 200 }
    );
  }
}
