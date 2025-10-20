import { query } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    console.log("[v0 API] Fetching appointments for patient:", id);

    const result = await query(
      `SELECT 
        id,
        patient_id,
        appointment_date,
        appointment_time,
        consultation_type,
        doctor_name,
        notes,
        status,
        created_at,
        updated_at
       FROM appointments 
       WHERE patient_id = $1
       ORDER BY appointment_date DESC, appointment_time DESC`,
      [id]
    );

    console.log("[v0 API] Found", result.rows.length, "appointments");

    return Response.json({ appointments: result.rows });
  } catch (error) {
    console.error("[v0 API] Error fetching appointments:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log("[v0 API] Adding appointment for patient:", id);

    const {
      appointment_date,
      appointment_time,
      consultation_type,
      doctor_name,
      notes,
      status,
    } = body;

    const result = await query(
      `INSERT INTO appointments (
        patient_id, 
        appointment_date, 
        appointment_time, 
        consultation_type, 
        doctor_name, 
        notes,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        id,
        appointment_date,
        appointment_time,
        consultation_type || "General Consultation",
        doctor_name || "Dr. Smith",
        notes || "",
        status || "completed",
      ]
    );

    console.log("[v0 API] Appointment created successfully");

    return Response.json({ appointment: result.rows[0] });
  } catch (error) {
    console.error("[v0 API] Error adding appointment:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
