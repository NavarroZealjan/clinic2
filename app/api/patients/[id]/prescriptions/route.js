import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET all prescriptions for a patient
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const patientId = Number.parseInt(id);

    const result = await query(
      `SELECT * FROM prescriptions 
       WHERE patient_id = $1
       ORDER BY date DESC, created_at DESC`,
      [patientId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[v0] Error fetching prescriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}

// POST - Create new prescription
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const patientId = Number.parseInt(id);
    const data = await request.json();

    console.log("[v0] Creating prescription:", data);

    const result = await query(
      `INSERT INTO prescriptions (
        patient_id, doctor_name, date, medications, diagnosis, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        patientId,
        data.doctorName,
        data.date,
        JSON.stringify(data.medications),
        data.diagnosis,
        data.notes,
      ]
    );

    console.log("[v0] Prescription created successfully:", result.rows[0]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("[v0] Error creating prescription:", error);
    return NextResponse.json(
      { error: "Failed to create prescription" },
      { status: 500 }
    );
  }
}

// DELETE prescription
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get("entryId");

    if (!prescriptionId) {
      return NextResponse.json(
        { error: "Prescription ID is required" },
        { status: 400 }
      );
    }

    const result = await query(
      `DELETE FROM prescriptions WHERE id = $1 AND patient_id = $2 RETURNING id`,
      [Number.parseInt(prescriptionId), Number.parseInt(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Prescription deleted successfully" });
  } catch (error) {
    console.error("[v0] Error deleting prescription:", error);
    return NextResponse.json(
      { error: "Failed to delete prescription" },
      { status: 500 }
    );
  }
}
