import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST - Add lab result entry
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const patientId = Number.parseInt(id);
    const data = await request.json();

    console.log("[v0] Adding lab result for patient:", patientId, data);

    const result = await query(
      `INSERT INTO lab_results (patient_id, date, file_name, file_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [patientId, data.date, data.fileName || null, data.fileUrl || null]
    );

    console.log("[v0] Lab result saved successfully:", result.rows[0]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("[v0] Error adding lab result:", error);
    return NextResponse.json(
      { error: "Failed to add lab result", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove lab result entry
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("entryId");

    await query(`DELETE FROM lab_results WHERE id = $1`, [entryId]);

    return NextResponse.json({ message: "Lab result deleted successfully" });
  } catch (error) {
    console.error("[v0] Error deleting lab result:", error);
    return NextResponse.json(
      { error: "Failed to delete lab result" },
      { status: 500 }
    );
  }
}
