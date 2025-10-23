import { query } from "@/lib/db";

// GET single user
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(
      "SELECT id, email, username, full_name, role, created_at FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("[v0] Error fetching user:", error);
    return Response.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PUT update user
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { email, full_name, role, password } = await request.json();

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email) {
      updates.push(`email = $${paramCount}`);
      updates.push(`username = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (full_name) {
      updates.push(`full_name = $${paramCount}`);
      values.push(full_name);
      paramCount++;
    }

    if (role) {
      if (!["admin", "doctor", "staff"].includes(role)) {
        return Response.json({ error: "Invalid role" }, { status: 400 });
      }
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (password) {
      updates.push(`password = $${paramCount}`);
      values.push(password);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${updates.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING id, email, full_name, role`,
      values
    );

    if (result.rows.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("[v0] Error updating user:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const result = await query("DELETE FROM users WHERE id = $1 RETURNING id", [
      id,
    ]);

    if (result.rows.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("[v0] Error deleting user:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
