import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET single patient with medical records
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const patientId = Number.parseInt(id);

    const patientResult = await query(`SELECT * FROM patients WHERE id = $1`, [
      patientId,
    ]);

    if (patientResult.rows.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patient = patientResult.rows[0];

    const medicalHistoryResult = await query(
      `SELECT * FROM medical_history 
       WHERE patient_id = $1
       ORDER BY date DESC`,
      [patientId]
    );

    const labResultsResult = await query(
      `SELECT * FROM lab_results 
       WHERE patient_id = $1
       ORDER BY date DESC`,
      [patientId]
    );

    const notesResult = await query(
      `SELECT * FROM notes 
       WHERE patient_id = $1
       ORDER BY created_at DESC`,
      [patientId]
    );

    return NextResponse.json({
      ...patient,
      medical_history: medicalHistoryResult.rows,
      lab_results: labResultsResult.rows,
      notes: notesResult.rows,
    });
  } catch (error) {
    console.error("[v0] Error fetching patient:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}

// PUT - Update patient
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const patientId = Number.parseInt(id);
    const data = await request.json();

    const result = await query(
      `UPDATE patients SET
        full_name = $1,
        email = $2,
        address = $3,
        date_of_birth = $4,
        blood_type = $5,
        contact_number = $6,
        gender = $7,
        emergency_contact_name = $8,
        emergency_contact_number = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *`,
      [
        data.fullName,
        data.email,
        data.address,
        data.dateOfBirth,
        data.bloodType,
        data.contactNumber,
        data.gender,
        data.emergencyContactName,
        data.emergencyContactNumber,
        patientId,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("[v0] Error updating patient:", error);
    return NextResponse.json(
      { error: "Failed to update patient" },
      { status: 500 }
    );
  }
}

// DELETE patient
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const patientId = Number.parseInt(id);

    const result = await query(
      `DELETE FROM patients WHERE id = $1 RETURNING id`,
      [patientId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("[v0] Error deleting patient:", error);
    return NextResponse.json(
      { error: "Failed to delete patient" },
      { status: 500 }
    );
  }
}
