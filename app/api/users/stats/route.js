import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'doctor' THEN 1 END) as doctors,
        COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
      FROM users
    `);

    const stats = {
      totalUsers: Number.parseInt(result.rows[0].total_users),
      doctors: Number.parseInt(result.rows[0].doctors),
      staff: Number.parseInt(result.rows[0].staff),
      admins: Number.parseInt(result.rows[0].admins),
    };

    return Response.json(stats);
  } catch (error) {
    console.error("[v0] Error fetching user stats:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
