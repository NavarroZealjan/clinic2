import { NextResponse } from "next/server";

const MOCK_PATIENTS = [];

// GET all patients with search and pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let filteredPatients = MOCK_PATIENTS;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPatients = MOCK_PATIENTS.filter(
        (p) =>
          p.full_name.toLowerCase().includes(searchLower) ||
          p.contact_number.includes(search)
      );
    }

    const paginatedPatients = filteredPatients.slice(offset, offset + limit);

    return NextResponse.json({
      patients: paginatedPatients,
      total: filteredPatients.length,
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

    const newPatient = {
      id: MOCK_PATIENTS.length + 1,
      full_name: data.fullName,
      email: data.email,
      address: data.address,
      date_of_birth: data.dateOfBirth,
      blood_type: data.bloodType,
      contact_number: data.contactNumber,
      gender: data.gender,
      emergency_contact_name: data.emergencyContactName,
      emergency_contact_number: data.emergencyContactNumber,
      created_at: new Date(),
      updated_at: new Date(),
    };

    MOCK_PATIENTS.push(newPatient);

    return NextResponse.json({ patient: newPatient }, { status: 201 });
  } catch (error) {
    console.error("[v0] Error creating patient:", error);
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}
