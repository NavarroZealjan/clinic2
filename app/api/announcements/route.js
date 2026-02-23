import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Fetch all announcements (staff sees all, chatbot sees only active/non-expired)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forChatbot = searchParams.get("chatbot") === "true";

    let sql = "SELECT * FROM clinic_announcements";

    if (forChatbot) {
      // Chatbot only sees active, non-expired announcements
      sql +=
        " WHERE is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)";
    }

    sql += " ORDER BY created_at DESC";

    const result = await query(sql);
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
      `INSERT INTO clinic_announcements (title, message, category, is_active, expires_at)
       VALUES ($1, $2, $3, true, $4)
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
