import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("q");

    if (!searchQuery || searchQuery.trim().length < 2) {
      return NextResponse.json([]);
    }

    console.log("[v0] Searching patients with query:", searchQuery);

    // Search by name, phone, or email
    const searchPattern = `%${searchQuery}%`;
    const result = await query(
      `SELECT 
        id, 
        full_name, 
        email, 
        contact_number, 
        date_of_birth,
        created_at
      FROM patients 
      WHERE 
        full_name ILIKE $1 OR 
        contact_number ILIKE $1 OR 
        email ILIKE $1
      ORDER BY full_name
      LIMIT 10`,
      [searchPattern]
    );

    // Get last appointment for each patient
    const patientsWithLastVisit = await Promise.all(
      result.rows.map(async (patient) => {
        const lastAppointment = await query(
          `SELECT appointment_date, appointment_time 
           FROM appointments 
           WHERE patient_id = $1 
           ORDER BY appointment_date DESC, appointment_time DESC 
           LIMIT 1`,
          [patient.id]
        );

        return {
          ...patient,
          lastVisit: lastAppointment.rows[0]
            ? `${lastAppointment.rows[0].appointment_date} ${lastAppointment.rows[0].appointment_time}`
            : "No previous visits",
        };
      })
    );

    console.log("[v0] Found patients:", patientsWithLastVisit.length);
    return NextResponse.json(patientsWithLastVisit);
  } catch (error) {
    console.error("[v0] Error searching patients:", error);
    return NextResponse.json(
      { error: "Failed to search patients" },
      { status: 500 }
    );
  }
}
