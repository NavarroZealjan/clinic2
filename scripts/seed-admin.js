// scripts/seed-admin.js
import { pool } from '../lib/db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  try {
    const username = process.env.SEED_ADMIN_USERNAME || 'admin';
    const password = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123';
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO users (username, password, full_name, role) VALUES ($1,$2,$3,$4) RETURNING id', [username, hashed, 'Administrator', 'admin']);
    console.log('Admin created with id', result.rows[0].id);
    process.exit(0);
  } catch (err) {
    if (err.code === '23505') {
      console.log('Admin already exists');
      process.exit(0);
    } else {
      console.error(err);
      process.exit(1);
    }
  }
}

seed();
