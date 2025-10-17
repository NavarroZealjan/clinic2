import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Mark notification as read
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { isRead } = await request.json();

    await pool.query(`UPDATE notifications SET is_read = $1 WHERE id = $2`, [
      isRead,
      id,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// Delete notification
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await pool.query(`DELETE FROM notifications WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
