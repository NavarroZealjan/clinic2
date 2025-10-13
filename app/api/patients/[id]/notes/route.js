import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST - Add note
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const patientId = Number.parseInt(id);
    const data = await request.json();

    const result = await query(
      `INSERT INTO notes (patient_id, content)
       VALUES ($1, $2)
       RETURNING *`,
      [patientId, data.content]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("[v0] Error adding note:", error);
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
  }
}

// DELETE - Remove note
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("entryId");

    await query(`DELETE FROM notes WHERE id = $1`, [entryId]);

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("[v0] Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
