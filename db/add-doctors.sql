-- Add doctor users to the database
-- Run this in pgAdmin or using: node scripts/run-sql.js db/add-doctors.sql

INSERT INTO users
    (username, password, role, full_name)
VALUES
    ('dr.wison@clinic.com', 'doctor123', 'doctor', 'Dr. Wison'),
    ('dr.smith@clinic.com', 'doctor123', 'doctor', 'Dr. Smith'),
    ('dr.wales@clinic.com', 'doctor123', 'doctor', 'Dr. Wales');

-- View all users
SELECT id, username, role, full_name
FROM users
ORDER BY role, id;
