import { pool } from "./lib/db.js"; // adjust path if needed
import bcrypt from "bcryptjs";

async function hashAndUpdateUser(username, plainPassword) {
  try {
    // Hash the plain password
    const hashed = await bcrypt.hash(plainPassword, 10);
    console.log("Hashed password:", hashed);

    // Update the database
    await pool.query("UPDATE users SET password=$1 WHERE username=$2", [
      hashed,
      username,
    ]);

    console.log(`Password for user '${username}' updated successfully.`);
  } catch (err) {
    console.error("Error updating password:", err);
  } finally {
    await pool.end();
  }
}

// Replace with your username and plain password
hashAndUpdateUser("zealjan", "capstone2");
