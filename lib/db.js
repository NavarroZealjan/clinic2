// lib/db.js
import pkg from "pg";
const { Pool } = pkg;

let pool;

try {
  pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "clinicdb",
    password: "capstone2",
    port: 5432,
  });
  console.log("✅ DB Pool created");
} catch (err) {
  console.error("❌ Failed to create DB pool:", err);
}

export { pool };
