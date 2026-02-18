import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Get all notes for a patient
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const patientId = Number.parseInt(id);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let sql = `
      SELECT n.*, u.name as doctor_name
      FROM notes n
      LEFT JOIN users u ON n.doctor_id = u.id
      WHERE n.patient_id = $1
    `;
    const values = [patientId];

    if (status) {
      sql += ` AND n.status = $2`;
      values.push(status);
    }

    sql += ` ORDER BY n.updated_at DESC, n.created_at DESC`;

    const result = await query(sql, values);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 },
    );
  }
}

// POST - Add new note (draft or finalized)
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const patientId = Number.parseInt(id);
    const data = await request.json();

    const { title, content, status = "draft", appointmentId, doctorId } = data;

    const result = await query(
      `INSERT INTO notes (patient_id, title, content, status, appointment_id, doctor_id, last_auto_saved, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        patientId,
        title || null,
        content,
        status,
        appointmentId || null,
        doctorId || null,
      ],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json(
      { error: "Failed to add note", details: error.message },
      { status: 500 },
    );
  }
}

// PUT - Update note (for auto-save and finalize)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const patientId = Number.parseInt(id);
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json(
        { error: "noteId is required" },
        { status: 400 },
      );
    }

    const data = await request.json();
    const { title, content, status } = data;

    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }

    if (content !== undefined) {
      updateFields.push(`content = $${paramCount}`);
      values.push(content);
      paramCount++;
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    updateFields.push(`last_auto_saved = CURRENT_TIMESTAMP`);
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(noteId);
    values.push(patientId);

    console.log("[v0] Updating note:", {
      noteId,
      patientId,
      updateFields,
      values,
    });

    const result = await query(
      `UPDATE notes 
       SET ${updateFields.join(", ")}
       WHERE id = $${paramCount} AND patient_id = $${paramCount + 1}
       RETURNING *`,
      values,
    );

    console.log("[v0] Update result:", result.rows);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("[v0] Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note", details: error.message },
      { status: 500 },
    );
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
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 },
    );
  }
}
