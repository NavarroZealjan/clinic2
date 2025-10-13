import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST - Add medical history entry
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const patientId = Number.parseInt(id);
    const data = await request.json();

    const result = await query(
      `INSERT INTO medical_history (patient_id, date, diagnosis)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [patientId, data.date, data.diagnosis]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("[v0] Error adding medical history:", error);
    return NextResponse.json(
      { error: "Failed to add medical history" },
      { status: 500 }
    );
  }
}

// DELETE - Remove medical history entry
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("entryId");

    await query(`DELETE FROM medical_history WHERE id = $1`, [entryId]);

    return NextResponse.json({
      message: "Medical history deleted successfully",
    });
  } catch (error) {
    console.error("[v0] Error deleting medical history:", error);
    return NextResponse.json(
      { error: "Failed to delete medical history" },
      { status: 500 }
    );
  }
}
