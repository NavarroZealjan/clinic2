// Notification utility for sending emails and creating in-app notifications
import pool from "./db.js";

// Create in-app notification
export async function createNotification({
  userId,
  appointmentId,
  title,
  message,
  type = "info",
}) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, appointment_id, title, message, type)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, appointmentId, title, message, type]
    );
    return { success: true };
  } catch (error) {
    console.error("[v0] Error creating notification:", error);
    return { success: false, error: error.message };
  }
}

// Send email notification using Resend API directly with fetch
export async function sendEmailNotification({ to, subject, message }) {
  try {
    console.log("[v0] ==========================================");
    console.log("[v0] Attempting to send email...");
    console.log("[v0] To:", to);
    console.log("[v0] Subject:", subject);
    console.log("[v0] RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] ❌ RESEND_API_KEY is not set!");
      return { success: false, error: "RESEND_API_KEY is not configured" };
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "E-Clinic <onboarding@resend.dev>",
        to: [to],
        subject: subject,
        html: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[v0] ❌ Error sending email:", data);
      return { success: false, error: data.message || "Failed to send email" };
    }

    console.log("[v0] ✅ Email sent successfully!");
    console.log("[v0] Email ID:", data.id);
    console.log("[v0] ==========================================");
    return { success: true, data };
  } catch (error) {
    console.error("[v0] ❌ Exception while sending email:", error);
    console.error("[v0] Error details:", error.message);
    console.log("[v0] ==========================================");
    return { success: false, error: error.message };
  }
}

// Send appointment notification (both email and in-app)
export async function sendAppointmentNotification({
  userId,
  appointmentId,
  email,
  phone,
  patientName,
  status,
  appointmentDate,
  reason,
}) {
  let title, message, type;

  switch (status) {
    case "pending":
      title = "Appointment Booking Confirmed";
      message = `Dear ${patientName}, your appointment request for ${reason} on ${appointmentDate} has been received and is pending approval. We'll notify you once it's confirmed.`;
      type = "info";
      break;
    case "approved":
      title = "Appointment Approved ✓";
      message = `Great news ${patientName}! Your appointment for ${reason} on ${appointmentDate} has been approved. Please arrive 10 minutes early.`;
      type = "success";
      break;
    case "rejected":
      title = "Appointment Not Available";
      message = `Dear ${patientName}, unfortunately we cannot accommodate your appointment request for ${reason} on ${appointmentDate}. Please contact us to reschedule.`;
      type = "error";
      break;
    case "cancelled":
      title = "Appointment Cancelled";
      message = `Dear ${patientName}, your appointment for ${reason} on ${appointmentDate} has been cancelled. Contact us if you'd like to reschedule.`;
      type = "warning";
      break;
    case "completed":
      title = "Appointment Completed";
      message = `Thank you for visiting our clinic, ${patientName}! Your appointment on ${appointmentDate} has been completed.`;
      type = "success";
      break;
    default:
      title = "Appointment Update";
      message = `Dear ${patientName}, your appointment status has been updated.`;
      type = "info";
  }

  // Create in-app notification
  await createNotification({
    userId,
    appointmentId,
    title,
    message,
    type,
  });

  // Send email notification (logged to console for capstone)
  await sendEmailNotification({
    to: email,
    subject: title,
    message: `
      <h2>${title}</h2>
      <p>${message}</p>
      <hr>
      <p><strong>Appointment Details:</strong></p>
      <ul>
        <li>Date: ${appointmentDate}</li>
        <li>Reason: ${reason}</li>
        <li>Status: ${status.toUpperCase()}</li>
      </ul>
      <p>Contact: ${phone}</p>
      <p><em>E-Clinic Management System</em></p>
    `,
  });

  return { success: true };
}
