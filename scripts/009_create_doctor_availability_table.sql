-- Create doctor availability table for managing appointment slots
CREATE TABLE
IF NOT EXISTS doctor_availability
(
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES users
(id) ON
DELETE CASCADE,
  day_of_week VARCHAR(20)
NOT NULL, -- MONDAY, TUESDAY, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  max_appointments_per_slot INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX
IF NOT EXISTS idx_doctor_availability_doctor_id ON doctor_availability
(doctor_id);
CREATE INDEX
IF NOT EXISTS idx_doctor_availability_day ON doctor_availability
(day_of_week);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_doctor_availability_updated_at
()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER doctor_availability_updated_at
BEFORE
UPDATE ON doctor_availability
FOR EACH ROW
EXECUTE FUNCTION update_doctor_availability_updated_at
();
