import { NextResponse } from "next/server";

// Mock patient data
const MOCK_PATIENTS = [
  {
    id: 1,
    full_name: "John Smith",
    email: "john.smith@email.com",
    address: "123 Main St, City",
    date_of_birth: "1985-03-15",
    blood_type: "A+",
    contact_number: "555-0101",
    gender: "Male",
    emergency_contact_name: "Jane Smith",
    emergency_contact_number: "555-0102",
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-01-15"),
  },
  {
    id: 2,
    full_name: "Sarah Johnson",
    email: "sarah.j@email.com",
    address: "456 Oak Ave, Town",
    date_of_birth: "1990-07-22",
    blood_type: "O+",
    contact_number: "555-0201",
    gender: "Female",
    emergency_contact_name: "Mike Johnson",
    emergency_contact_number: "555-0202",
    created_at: new Date("2024-02-10"),
    updated_at: new Date("2024-02-10"),
  },
  {
    id: 3,
    full_name: "Michael Brown",
    email: "m.brown@email.com",
    address: "789 Pine Rd, Village",
    date_of_birth: "1978-11-30",
    blood_type: "B+",
    contact_number: "555-0301",
    gender: "Male",
    emergency_contact_name: "Lisa Brown",
    emergency_contact_number: "555-0302",
    created_at: new Date("2024-03-05"),
    updated_at: new Date("2024-03-05"),
  },
  {
    id: 4,
    full_name: "Emily Davis",
    email: "emily.d@email.com",
    address: "321 Elm St, City",
    date_of_birth: "1995-05-18",
    blood_type: "AB+",
    contact_number: "555-0401",
    gender: "Female",
    emergency_contact_name: "Robert Davis",
    emergency_contact_number: "555-0402",
    created_at: new Date("2024-04-12"),
    updated_at: new Date("2024-04-12"),
  },
  {
    id: 5,
    full_name: "David Wilson",
    email: "d.wilson@email.com",
    address: "654 Maple Dr, Town",
    date_of_birth: "1982-09-25",
    blood_type: "O-",
    contact_number: "555-0501",
    gender: "Male",
    emergency_contact_name: "Anna Wilson",
    emergency_contact_number: "555-0502",
    created_at: new Date("2024-05-20"),
    updated_at: new Date("2024-05-20"),
  },
];

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
