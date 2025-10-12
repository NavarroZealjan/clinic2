import { NextResponse } from "next/server";

const MOCK_USERS = [
  {
    id: 1,
    username: "staff1",
    password: "password123",
    role: "staff",
    fullName: "Staff Member",
  },
  {
    id: 2,
    username: "zealjan@gmail.com",
    password: "capstone2",
    role: "admin",
    fullName: "Zealjan Admin",
  },
  {
    id: 3,
    username: "datan@gmail.com",
    password: "capstone2",
    role: "staff",
    fullName: "Datan Staff",
  },
  {
    id: 5,
    username: "dr.wison@clinic.com",
    password: "doctor123",
    role: "doctor",
    fullName: "Dr. Wison",
  },
  {
    id: 6,
    username: "dr.smith@clinic.com",
    password: "doctor123",
    role: "doctor",
    fullName: "Dr. Smith",
  },
  {
    id: 7,
    username: "dr.wales@clinic.com",
    password: "doctor123",
    role: "doctor",
    fullName: "Dr. Wales",
  },
];

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    console.log("[v0] Login attempt for:", username);

    const user = MOCK_USERS.find((u) => u.username === username);

    if (!user) {
      console.log("[v0] User not found:", username);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    console.log("[v0] User found:", user.username, "Role:", user.role);

    if (password !== user.password) {
      console.log("[v0] Invalid password");
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    console.log("[v0] Login successful for:", user.username);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("[v0] Login error:", error);
    return NextResponse.json(
      { error: "Login error", details: error.message },
      { status: 500 }
    );
  }
}
