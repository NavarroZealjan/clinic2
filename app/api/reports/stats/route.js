import { NextResponse } from "next/server";
import { getAppointmentsStore } from "@/lib/appointments-store";

export async function GET() {
  try {
    const store = getAppointmentsStore();
    const appointments = store.appointments;

    // Calculate monthly revenue (mock calculation)
    const totalRevenue = appointments.length * 1000;

    // Calculate patient satisfaction (mock - would come from surveys)
    const patientSatisfaction = 75;

    // Calculate total appointments
    const totalAppointments = appointments.length;

    // Calculate no-shows (mock - would need a noShow field)
    const noShows = Math.floor(appointments.length * 0.1);

    // Group appointments by month from their appointmentDate
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Initialize counts for last 7 months
    const monthCounts = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentYear, currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthCounts[monthKey] = {
        month: monthNames[date.getMonth()],
        appointments: 0,
      };
    }

    // Count appointments by month
    appointments.forEach((apt) => {
      if (apt.appointmentDate) {
        const aptDate = new Date(apt.appointmentDate);
        const monthKey = `${aptDate.getFullYear()}-${aptDate.getMonth()}`;
        if (monthCounts[monthKey]) {
          monthCounts[monthKey].appointments++;
        }
      }
    });

    const trends = Object.values(monthCounts);

    return NextResponse.json({
      totalRevenue,
      patientSatisfaction,
      totalAppointments,
      noShows,
      trends,
      recentAppointments: appointments.slice(0, 5).map((apt) => ({
        id: apt.id,
        date: apt.appointmentDate,
        time: apt.appointmentTime,
        patientName: apt.fullName,
        physician: "DR. SMITH", // Mock - would come from appointment data
        duration: Math.floor(Math.random() * 10) + 15,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
