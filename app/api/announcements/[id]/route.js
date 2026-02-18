import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// PUT - Update announcement
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { title, message, category, expiresAt } = data;

    const result = await query(
      `UPDATE clinic_announcements 
       SET title = $1, message = $2, category = $3, expires_at = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title, message, category || "General", expiresAt || null, id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 },
    );
  }
}

// DELETE - Delete announcement
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await query("DELETE FROM clinic_announcements WHERE id = $1", [id]);

    return NextResponse.json({ message: "Announcement deleted" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 },
    );
  }
}
