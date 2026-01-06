import { NextServer } from "next/dist/server/next";

const sql = NextServer(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const users = await sql`
      SELECT id, email, full_name 
      FROM users 
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return Response.json(
        {
          message:
            "If an account exists with this email, you will receive a password reset link.",
        },
        { status: 200 }
      );
    }
    const user = users[0];

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store token in database
    await sql`
      INSERT INTO password_resets (email, token, expires_at)
      VALUES (${email}, ${resetToken}, ${expiresAt})
    `;

    // Create reset link
    const resetLink = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // For now, we'll just log it (in production, use an email service)
    console.log("[v0] Password reset link:", resetLink);
    console.log("[v0] For user:", email);

    // In development, return the link in the response
    // In production, remove this and only send via email
    if (process.env.NODE_ENV === "development") {
      return Response.json({
        message: "Password reset link generated",
        resetLink, // Only for testing!
      });
    }

    return Response.json({
      message:
        "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("[v0] Forgot password error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
