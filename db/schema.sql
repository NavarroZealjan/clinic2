-- Users table for authentication
CREATE TABLE
IF NOT EXISTS users
(
  id SERIAL PRIMARY KEY,
  username VARCHAR
(100) UNIQUE NOT NULL,
  password VARCHAR
(255) NOT NULL,
  role VARCHAR
(20) NOT NULL CHECK
(role IN
('admin', 'staff', 'doctor')),
  full_name VARCHAR
(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Added patients table for patient management
CREATE TABLE
IF NOT EXISTS patients
(
  id SERIAL PRIMARY KEY,
  full_name VARCHAR
(200) NOT NULL,
  email VARCHAR
(100),
  address TEXT,
  date_of_birth DATE NOT NULL,
  blood_type VARCHAR
(10),
  contact_number VARCHAR
(20) NOT NULL,
  gender VARCHAR
(10) NOT NULL CHECK
(gender IN
('male', 'female')),
  emergency_contact_name VARCHAR
(200),
  emergency_contact_number VARCHAR
(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX
IF NOT EXISTS idx_patients_full_name ON patients
(full_name);
CREATE INDEX
IF NOT EXISTS idx_patients_contact ON patients
(contact_number);

-- Insert sample users (passwords are plain text for testing)
-- In production, use bcrypt to hash passwords
INSERT INTO users
  (username, password, role, full_name)
VALUES
  ('zealjan', '$2a$10$pYxWldCD5Tpdxg9lllCOmOxeBQ5i2xxLwGR/vj3yJ6N6RSET8NGeG', 'admin', 'Zealjan Admin'),
  ('staff1', 'password123', 'staff', 'Staff Member'),
  ('zealjan@gmail.com', 'capstone2', 'admin', 'Zealjan Admin'),
  ('datan@gmail.com', 'capstone2', 'staff', 'Datan Staff')
,
ON CONFLICT
(username) DO NOTHING;

-- Insert sample patients for testing
INSERT INTO patients
  (full_name, email, address, date_of_birth, blood_type, contact_number, gender, emergency_contact_name, emergency_contact_number)
VALUES
  ('JHONREYBERT SAYRAYNO', 'jhon@example.com', '123 Main St, City', '2003-02-15', 'O+', '09270378201', 'male', 'Maria Sayrayno', '09171234567'),
  ('ZEALJAN NAVARRO', 'zealjan@example.com', '456 Oak Ave, Town', '2003-02-15', 'A+', '09270378201', 'male', 'Juan Navarro', '09181234567'),
  ('JOHN LAWRENCE DATAN', 'john@example.com', '789 Pine Rd, Village', '2003-02-15', 'B+', '09270378201', 'male', 'Ana Datan', '09191234567'),
  ('ANGELO CABRAS', 'angelo@example.com', '321 Elm St, City', '2003-02-15', 'AB+', '09270378201', 'male', 'Rosa Cabras', '09201234567')
ON CONFLICT DO NOTHING;
