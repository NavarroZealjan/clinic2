-- db/schema.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'doctor',
  full_name VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  dob DATE,
  contact VARCHAR(100)
);

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending'
);
