import bcrypt from "bcrypt";
import { pool } from "./lib/db.js"; // adjust path as needed

async function testLogin() {
  console.log("✅ DB Pool created");

  const username = "zealjan";
  const password = "capstone2"; // plain password from request

  // Get user from DB
  const res = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  const user = res.rows[0];

  if (!user) {
    console.log("❌ User not found");
    return;
  }

  console.log("Username from request:", username);
  console.log("Password from request:", password);
  console.log("Stored username:", user.username);
  console.log("Stored password:", user.password);
  console.log("Stored password length:", user.password.length);

  // ✅ Proper bcrypt comparison
  const match = await bcrypt.compare(password, user.password);
  console.log("Password match?", match ? "✅ YES" : "❌ NO");
}

testLogin();
