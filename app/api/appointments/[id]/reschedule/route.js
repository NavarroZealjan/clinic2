import { NextResponse } from "next/server";
import { getAppointmentsStore } from "@/lib/appointments-store";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { appointmentDate, appointmentTime, doctorName } =
      await request.json();

    const store = getAppointmentsStore();
    console.log(`[v0] Rescheduling appointment ${id}`);
    console.log(`[v0] New details:`, {
      appointmentDate,
      appointmentTime,
      doctorName,
    });

    const appointmentIndex = store.appointments.findIndex(
      (apt) => apt.id === Number.parseInt(id)
    );

    if (appointmentIndex === -1) {
      console.log(`[v0] Appointment ${id} not found`);
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    store.appointments[appointmentIndex] = {
      ...store.appointments[appointmentIndex],
      appointmentDate,
      appointmentTime,
      doctorName: doctorName || store.appointments[appointmentIndex].doctorName,
      status: "pending", // Reset to pending when rescheduled
      updatedAt: new Date().toISOString(),
    };

    console.log(`[v0] Appointment ${id} rescheduled successfully`);
    console.log(
      `[v0] Updated appointment:`,
      store.appointments[appointmentIndex]
    );

    return NextResponse.json(store.appointments[appointmentIndex]);
  } catch (error) {
    console.error("[v0] Error rescheduling appointment:", error);
    return NextResponse.json(
      { error: "Failed to reschedule appointment", details: error.message },
      { status: 500 }
    );
  }
}
