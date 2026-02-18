import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Fetch all active announcements
export async function GET() {
  try {
    const result = await query(
      `SELECT * FROM clinic_announcements 
       WHERE is_active = true 
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
       ORDER BY created_at DESC`,
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 },
    );
  }
}

// POST - Create new announcement
export async function POST(request) {
  try {
    const data = await request.json();
    const { title, message, category = "General", expiresAt } = data;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message required" },
        { status: 400 },
      );
    }

    const result = await query(
      `INSERT INTO clinic_announcements (title, message, category, expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [title, message, category, expiresAt || null],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 },
    );
  }
}
