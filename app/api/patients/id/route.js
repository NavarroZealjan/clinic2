import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET single patient
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await pool.query("SELECT * FROM patients WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ patient: result.rows[0] });
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
    const { id } = params;
    const data = await request.json();

    const result = await pool.query(
      `UPDATE patients SET
        full_name = $1, email = $2, address = $3, date_of_birth = $4,
        blood_type = $5, contact_number = $6, gender = $7,
        emergency_contact_name = $8, emergency_contact_number = $9,
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
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ patient: result.rows[0] });
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
    const { id } = params;

    const result = await pool.query(
      "DELETE FROM patients WHERE id = $1 RETURNING id",
      [id]
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
