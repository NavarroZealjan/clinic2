import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT id, username, full_name, role
      FROM users
      WHERE role = 'doctor'
      ORDER BY full_name
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error("[v0] Error fetching doctors:", error);
    return Response.json({ error: "Failed to fetch doctors" }, { status: 500 });
  }
}
    