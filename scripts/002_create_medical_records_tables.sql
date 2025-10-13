-- Create medical_history table
CREATE TABLE
IF NOT EXISTS medical_history
(
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients
(id) ON
DELETE CASCADE,
  date DATE
NOT NULL,
  diagnosis TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create lab_results table
CREATE TABLE
IF NOT EXISTS lab_results
(
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients
(id) ON
DELETE CASCADE,
  date DATE
NOT NULL,
  file_name VARCHAR
(255),
  file_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notes table
CREATE TABLE
IF NOT EXISTS notes
(
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients
(id) ON
DELETE CASCADE,
  content TEXT
NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX
IF NOT EXISTS idx_medical_history_patient_id ON medical_history
(patient_id);
CREATE INDEX
IF NOT EXISTS idx_lab_results_patient_id ON lab_results
(patient_id);
CREATE INDEX
IF NOT EXISTS idx_notes_patient_id ON notes
(patient_id);
