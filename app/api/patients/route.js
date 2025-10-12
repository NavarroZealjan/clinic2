import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET all patients with search and pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, full_name, email, address, date_of_birth, blood_type, 
             contact_number, gender, emergency_contact_name, emergency_contact_number,
             created_at, updated_at
      FROM patients
    `;
    let countQuery = "SELECT COUNT(*) FROM patients";
    const params = [];

    if (search) {
      query += " WHERE full_name ILIKE $1 OR contact_number ILIKE $1";
      countQuery += " WHERE full_name ILIKE $1 OR contact_number ILIKE $1";
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    const [patientsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : []),
    ]);

    return NextResponse.json({
      patients: patientsResult.rows,
      total: Number.parseInt(countResult.rows[0].count),
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
    const data = await request.json();

    const result = await pool.query(
      `INSERT INTO patients (
        full_name, email, address, date_of_birth, blood_type, 
        contact_number, gender, emergency_contact_name, emergency_contact_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.fullName,
        data.email,
        data.address,
        data.dateOfBirth,
        data.bloodType,
        data.contactNumber,
        data.gender,
        data.emergencyContactName,
        data.emergencyContactNumber,
      ]
    );

    return NextResponse.json({ patient: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("[v0] Error creating patient:", error);
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}
