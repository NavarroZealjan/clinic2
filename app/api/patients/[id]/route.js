import { NextResponse } from "next/server";

const MOCK_PATIENTS = [
  {
    id: 1,
    full_name: "Angelo Cabras",
    email: "act.acabras@gmail.com",
    phone: "09152374381",
    address: "Cebu City",
    date_of_birth: "2003-10-30",
    gender: "Male",
    blood_type: "B+",
    emergency_contact_name: "Ging Cabras",
    emergency_contact_number: "09152374381",
    created_at: "2025-08-07T12:31:00Z",
    updated_at: "2025-08-07T12:31:00Z",
  },
];

// GET single patient
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const patientId = Number.parseInt(id);

    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("[v0] Error fetching patient:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}

// PUT - Update patient
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const patientId = Number.parseInt(id);
    const data = await request.json();

    const patientIndex = MOCK_PATIENTS.findIndex((p) => p.id === patientId);

    if (patientIndex === -1) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    MOCK_PATIENTS[patientIndex] = {
      ...MOCK_PATIENTS[patientIndex],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(MOCK_PATIENTS[patientIndex]);
  } catch (error) {
    console.error("[v0] Error updating patient:", error);
    return NextResponse.json(
      { error: "Failed to update patient" },
      { status: 500 }
    );
  }
}

// DELETE patient
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const patientId = Number.parseInt(id);

    const patientIndex = MOCK_PATIENTS.findIndex((p) => p.id === patientId);

    if (patientIndex === -1) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    MOCK_PATIENTS.splice(patientIndex, 1);

    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("[v0] Error deleting patient:", error);
    return NextResponse.json(
      { error: "Failed to delete patient" },
      { status: 500 }
    );
  }
}
