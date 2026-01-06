import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
const sql = NextResponse(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return Response.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Find valid token
    const resetRequests = await sql`
      SELECT * FROM password_resets
      WHERE token = ${token}
        AND used = FALSE
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (resetRequests.length === 0) {
      return Response.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const resetRequest = resetRequests[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await sql`
      UPDATE users
      SET password = ${hashedPassword}
      WHERE email = ${resetRequest.email}
    `;

    // Mark token as used
    await sql`
      UPDATE password_resets
      SET used = TRUE
      WHERE id = ${resetRequest.id}
    `;

    console.log("[v0] Password reset successful for:", resetRequest.email);

    return Response.json({
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("[v0] Reset password error:", error);
    return Response.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}