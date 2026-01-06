import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT question FROM faq_knowledge ORDER BY priority DESC LIMIT 4"
    );

    const suggestions = result.rows.map((row) => row.question);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[v0] Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
