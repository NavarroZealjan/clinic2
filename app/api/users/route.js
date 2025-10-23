import { query } from "@/lib/db";

// GET all users
export async function GET() {
  try {
    const result = await query(
      "SELECT id, email, username, full_name, role, created_at FROM users ORDER BY created_at DESC"
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error("[v0] Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST create new user
export async function POST(request) {
  try {
    const { email, password, full_name, role } = await request.json();

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["admin", "doctor", "staff"].includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await query(
      "SELECT id FROM users WHERE email = $1 OR username = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }

    // Insert new user (password should be hashed in production)
    const result = await query(
      "INSERT INTO users (email, username, password, full_name, role, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id, email, full_name, role",
      [email, email, password, full_name, role]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("[v0] Error creating user:", error);
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
