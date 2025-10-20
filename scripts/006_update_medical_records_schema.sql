-- Add missing columns to medical_history table
ALTER TABLE medical_history 
ADD COLUMN
IF NOT EXISTS treatment TEXT,
ADD COLUMN
IF NOT EXISTS prescribed_medication TEXT,
ADD COLUMN
IF NOT EXISTS notes TEXT,
ADD COLUMN
IF NOT EXISTS visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN
IF NOT EXISTS doctor_name VARCHAR
(255);

-- Add missing columns to lab_results table
ALTER TABLE lab_results 
ADD COLUMN
IF NOT EXISTS test_name VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS results TEXT,
ADD COLUMN
IF NOT EXISTS notes TEXT;

-- Add missing columns to notes table
ALTER TABLE notes 
ADD COLUMN
IF NOT EXISTS created_by VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS note_text TEXT;

-- Copy existing content to note_text if it exists
UPDATE notes SET note_text = content WHERE note_text IS NULL AND content IS NOT NULL;
