import { NextResponse } from "next/server";
import { getAppointmentsStore } from "@/lib/appointments-store";
import { query } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { status } = await request.json();

    const store = getAppointmentsStore();
    console.log(
      `[v0] PATCH /api/appointments/${id} - Updating status to: ${status}`
    );
    console.log(
      `[v0] Current appointments count: ${store.appointments.length}`
    );

    const appointmentIndex = store.appointments.findIndex(
      (apt) => apt.id === Number.parseInt(id)
    );

    if (appointmentIndex === -1) {
      console.log(`[v0] Appointment ${id} not found`);
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    store.appointments[appointmentIndex] = {
      ...store.appointments[appointmentIndex],
      status,
      updatedAt: new Date().toISOString(),
    };

    console.log(
      `[v0] Appointment ${id} updated successfully to status: ${status}`
    );
    console.log(
      `[v0] Updated appointment:`,
      store.appointments[appointmentIndex]
    );

    if (status === "approved") {
      const appointment = store.appointments[appointmentIndex];

      try {
        console.log(
          `[v0] Creating patient record for approved appointment ${id}`
        );

        // Check if patient already exists by email
        const existingPatient = await query(
          `SELECT id FROM patients WHERE email = $1`,
          [appointment.email]
        );

        if (existingPatient.rows.length === 0) {
          // Create new patient record
          const patientResult = await query(
            `INSERT INTO patients (
              full_name, email, address, date_of_birth, blood_type, 
              contact_number, gender, emergency_contact_name, emergency_contact_number,
              created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            RETURNING *`,
            [
              appointment.fullName,
              appointment.email,
              appointment.address,
              appointment.dateOfBirth,
              appointment.bloodType,
              appointment.contactNumber,
              appointment.gender,
              appointment.emergencyContactName,
              appointment.emergencyContactNumber,
            ]
          );

          console.log(
            `[v0] Patient record created successfully:`,
            patientResult.rows[0]
          );
        } else {
          console.log(
            `[v0] Patient already exists with email: ${appointment.email}`
          );
        }
      } catch (dbError) {
        console.error(`[v0] Error creating patient record:`, dbError);
        // Don't fail the appointment approval if patient creation fails
      }
    }

    return NextResponse.json(store.appointments[appointmentIndex]);
  } catch (error) {
    console.error("[v0] Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const store = getAppointmentsStore();

    const appointment = store.appointments.find(
      (apt) => apt.id === Number.parseInt(id)
    );

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}
