import pool from "@/lib/db";
import { getAppointmentsStore } from "@/lib/appointments-store";

export async function POST(request) {
  try {
    const { doctorName, appointmentDate, appointmentTime } =
      await request.json();

    const store = getAppointmentsStore();

    const existingAppointments = store.appointments.filter(
      (apt) =>
        apt.doctorName === doctorName &&
        apt.appointmentDate === appointmentDate &&
        apt.appointmentTime === appointmentTime &&
        apt.status !== "cancelled" &&
        apt.status !== "rejected"
    );

    const dayOfWeek = new Date(appointmentDate)
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();

    const result = await pool.query(
      `
      SELECT da.max_appointments_per_slot
      FROM doctor_availability da
      JOIN users u ON da.doctor_id = u.id
      WHERE u.full_name = $1
        AND da.day_of_week = $2
        AND da.start_time <= $3
        AND da.end_time >= $3
        AND da.is_available = true
      LIMIT 1
    `,
      [doctorName, dayOfWeek, appointmentTime]
    );

    if (result.rows.length === 0) {
      return Response.json({
        available: false,
        reason: "Doctor is not available at this time",
        currentCount: existingAppointments.length,
        maxAllowed: 0,
      });
    }

    const maxAllowed = result.rows[0].max_appointments_per_slot;
    const currentCount = existingAppointments.length;

    return Response.json({
      available: currentCount < maxAllowed,
      reason:
        currentCount >= maxAllowed
          ? `This time slot is fully booked (${currentCount}/${maxAllowed} appointments)`
          : `Available (${currentCount}/${maxAllowed} appointments)`,
      currentCount,
      maxAllowed,
    });
  } catch (error) {
    console.error("[v0] Error checking availability:", error);
    return Response.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
