import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Get all notifications for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    let result;

    if (userId) {
      if (unreadOnly) {
        result = await pool.query(
          `SELECT * FROM notifications 
           WHERE user_id = $1 AND is_read = false
           ORDER BY created_at DESC`,
          [userId]
        );
      } else {
        result = await pool.query(
          `SELECT * FROM notifications 
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT 50`,
          [userId]
        );
      }
    } else {
      result = await pool.query(
        `SELECT * FROM notifications 
         ORDER BY created_at DESC
         LIMIT 100`
      );
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[v0] Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PATCH(request) {
  try {
    const { notificationId } = await request.json();

    await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1`,
      [notificationId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
