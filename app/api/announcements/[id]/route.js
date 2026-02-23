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
       SET title = COALESCE($1, title),
           message = COALESCE($2, message),
           category = COALESCE($3, category),
           expires_at = COALESCE($4, expires_at),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title || null, message || null, category || null, expiresAt || null, id],
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

// DELETE - Remove announcement
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const result = await query(
      "DELETE FROM clinic_announcements WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 },
    );
  }
}
