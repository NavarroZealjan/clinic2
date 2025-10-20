import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST - Add medical history entry
export async function POST(request, { params }) {
  try {
    console.log(
      "[v0 API] ========== POST /api/patients/[id]/medical-history =========="
    );

    const { id } = await params;
    const patientId = Number.parseInt(id);
    console.log("[v0 API] Patient ID:", patientId);

    const data = await request.json();
    console.log("[v0 API] Request body:", data);
    console.log("[v0 API] Date:", data.date);
    console.log("[v0 API] Diagnosis:", data.diagnosis);

    console.log("[v0 API] Executing INSERT query...");
    const result = await query(
      `INSERT INTO medical_history (patient_id, date, diagnosis)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [patientId, data.date, data.diagnosis]
    );

    console.log("[v0 API] Query executed successfully");
    console.log("[v0 API] Result rows:", result.rows);
    console.log("[v0 API] Saved record:", result.rows[0]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("[v0 API] ========== ERROR ==========");
    console.error("[v0 API] Error name:", error.name);
    console.error("[v0 API] Error message:", error.message);
    console.error("[v0 API] Error stack:", error.stack);
    console.error("[v0 API] Full error:", error);
    return NextResponse.json(
      { error: "Failed to add medical history", details: error.message },
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
    console.error("[v0 API] ========== ERROR ==========");
    console.error("[v0 API] Error name:", error.name);
    console.error("[v0 API] Error message:", error.message);
    console.error("[v0 API] Error stack:", error.stack);
    console.error("[v0 API] Full error:", error);
    return NextResponse.json(
      { error: "Failed to delete medical history" },
      { status: 500 }
    );
  }
}
