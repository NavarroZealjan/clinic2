-- Create patients table
CREATE TABLE
IF NOT EXISTS patients
(
  id SERIAL PRIMARY KEY,
  full_name VARCHAR
(255) NOT NULL,
  email VARCHAR
(255),
  address TEXT,
  date_of_birth DATE NOT NULL,
  blood_type VARCHAR
(10),
  contact_number VARCHAR
(50) NOT NULL,
  gender VARCHAR
(10) NOT NULL,
  emergency_contact_name VARCHAR
(255),
  emergency_contact_number VARCHAR
(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on full_name for faster searches
CREATE INDEX
IF NOT EXISTS idx_patients_full_name ON patients
(full_name);
CREATE INDEX
IF NOT EXISTS idx_patients_contact_number ON patients
(contact_number);
