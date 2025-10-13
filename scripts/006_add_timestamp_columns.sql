-- Add created_at and updated_at columns to patients table
DO $
$
BEGIN
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE patients ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END
IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
FROM information_schema.columns
WHERE table_name = 'patients' AND column_name = 'updated_at'
  ) THEN
ALTER TABLE patients ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END
IF;
END $$;

-- Add the same columns to medical_history table
DO $$
BEGIN
    IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'medical_history' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE medical_history ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END
IF;

  IF NOT EXISTS (
    SELECT 1
FROM information_schema.columns
WHERE table_name = 'medical_history' AND column_name = 'updated_at'
  ) THEN
ALTER TABLE medical_history ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END
IF;
END $$;

-- Add the same columns to lab_results table
DO $$
BEGIN
    IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'lab_results' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE lab_results ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END
IF;

  IF NOT EXISTS (
    SELECT 1
FROM information_schema.columns
WHERE table_name = 'lab_results' AND column_name = 'updated_at'
  ) THEN
ALTER TABLE lab_results ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END
IF;
END $$;

-- Add the same columns to notes table
DO $$
BEGIN
    IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE notes ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END
IF;

  IF NOT EXISTS (
    SELECT 1
FROM information_schema.columns
WHERE table_name = 'notes' AND column_name = 'updated_at'
  ) THEN
ALTER TABLE notes ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END
IF;
END $$;
