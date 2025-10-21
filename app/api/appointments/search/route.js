import { NextResponse } from "next/server";
import { getAppointmentsStore } from "@/lib/appointments-store";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email query missing" },
        { status: 400 }
      );
    }

    const store = getAppointmentsStore();
    console.log(`[v0] Searching for appointments by email: ${email}`);
    console.log(`[v0] Current store count: ${store.appointments.length}`);

    const appointments = store.appointments.filter(
      (apt) => apt.email?.toLowerCase() === email.toLowerCase()
    );

    if (appointments.length === 0) {
      return NextResponse.json(
        { error: "No appointments found" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("[v0] Error searching appointments:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
