-- Drop the existing appointments table and recreate with correct schema
DROP TABLE IF EXISTS appointments
CASCADE;

-- Create appointments table with correct columns
CREATE TABLE appointments
(
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(10) NOT NULL,
    consultation_type VARCHAR(100),
    doctor_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointments_updated_at
()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at
BEFORE
UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_appointments_updated_at
();
