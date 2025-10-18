import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET all patients with search and pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let result;
    let totalResult;

    if (search) {
      // Search by name or contact number
      result = await query(
        `SELECT * FROM patients 
         WHERE full_name ILIKE $1 OR contact_number LIKE $2
         ORDER BY created_at DESC
         LIMIT $3 OFFSET $4`,
        [`%${search}%`, `%${search}%`, limit, offset]
      );

      totalResult = await query(
        `SELECT COUNT(*) as count FROM patients 
         WHERE full_name ILIKE $1 OR contact_number LIKE $2`,
        [`%${search}%`, `%${search}%`]
      );
    } else {
      // Get all patients
      result = await query(
        `SELECT * FROM patients 
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      totalResult = await query(`SELECT COUNT(*) as count FROM patients`);
    }

    const patients = result.rows;
    const total = Number.parseInt(totalResult.rows[0].count);

    return NextResponse.json({
      patients,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[v0] Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

// POST - Create new patient
export async function POST(request) {
  try {
    console.log("[v0] POST /api/patients - Starting patient creation");

    const data = await request.json();
    console.log("[v0] Received patient data:", data);

    console.log("[v0] Attempting database insert...");
    const result = await query(
      `INSERT INTO patients (
        full_name, email, address, date_of_birth, blood_type, 
        contact_number, gender, emergency_contact_name, emergency_contact_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.fullName,
        data.email,
        data.address,
        data.dateOfBirth || data.dob, // Support both field names for compatibility
        data.bloodType,
        data.contactNumber,
        data.gender,
        data.emergencyContactName,
        data.emergencyContactNumber,
      ]
    );

    console.log("[v0] Patient created successfully:", result.rows[0]);
    return NextResponse.json({ patient: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("[v0] Error creating patient:", error);
    console.error("[v0] Error message:", error.message);
    console.error("[v0] Error stack:", error.stack);
    return NextResponse.json(
      {
        error: "Failed to create patient",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
