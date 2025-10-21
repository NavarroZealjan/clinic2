import pool from "@/lib/db";

// API route for managing doctor availability schedules

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");

    if (doctorId) {
      const result = await pool.query(
        `
        SELECT * FROM doctor_availability
        WHERE doctor_id = $1
        ORDER BY 
          CASE day_of_week
            WHEN 'MONDAY' THEN 1
            WHEN 'TUESDAY' THEN 2
            WHEN 'WEDNESDAY' THEN 3
            WHEN 'THURSDAY' THEN 4
            WHEN 'FRIDAY' THEN 5
            WHEN 'SATURDAY' THEN 6
            WHEN 'SUNDAY' THEN 7
          END,
          start_time
      `,
        [doctorId]
      );
      return Response.json(result.rows);
    }

    const result = await pool.query(`
      SELECT da.*, u.full_name as doctor_name
      FROM doctor_availability da
      JOIN users u ON da.doctor_id = u.id
      ORDER BY u.full_name, da.day_of_week, da.start_time
    `);
    return Response.json(result.rows);
  } catch (error) {
    console.error("[v0] Error fetching doctor availability:", error);
    return Response.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { doctorId, dayOfWeek, startTime, endTime, maxAppointmentsPerSlot } =
      data;

    console.log(
      "[v0] Attempting to create availability for doctorId:",
      doctorId
    );

    const doctorCheck = await pool.query(
      `SELECT id, full_name, role FROM users WHERE id = $1 AND role = 'doctor'`,
      [doctorId]
    );

    if (doctorCheck.rows.length === 0) {
      console.error("[v0] Doctor not found in database. DoctorId:", doctorId);
      return Response.json(
        {
          error: `Doctor with ID ${doctorId} does not exist in the database. Please log out and log in again to refresh your session.`,
          details:
            "The doctor ID in your session does not match any doctor in the database.",
        },
        { status: 400 }
      );
    }

    console.log("[v0] Doctor found:", doctorCheck.rows[0]);

    const result = await pool.query(
      `
      INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, max_appointments_per_slot)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [doctorId, dayOfWeek, startTime, endTime, maxAppointmentsPerSlot || 3]
    );

    console.log("[v0] Availability created successfully:", result.rows[0]);
    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("[v0] Error creating availability:", error);
    return Response.json(
      {
        error: error.message || "Failed to create availability",
        details: error.detail || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await pool.query(`DELETE FROM doctor_availability WHERE id = $1`, [id]);
    return Response.json({ success: true });
  } catch (error) {
    console.error("[v0] Error deleting availability:", error);
    return Response.json(
      { error: "Failed to delete availability" },
      { status: 500 }
    );
  }
}
