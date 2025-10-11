import { NextResponse } from "next/server";
import { pool } from "../../../lib/db"; // ✅ Correct import for Postgres

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Query user from PostgreSQL
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    // ✅ Compare plain text password (since DB passwords are not hashed)
    if (password !== user.password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // ✅ Login successful
    return NextResponse.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
