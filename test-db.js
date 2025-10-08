import { pool } from "./lib/db.js";

(async () => {
  try {
    console.log("Trying to connect to DB...");
    const res = await pool.query("SELECT NOW()");
    console.log("✅ DB connection OK:", res.rows);
    process.exit(0);
  } catch (err) {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  }
})();
