-- Add missing columns to patients table
DO $
$
BEGIN
    -- Add address column if it doesn't exist
    IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'address'
  ) THEN
    ALTER TABLE patients ADD COLUMN address TEXT;
END
IF;

  -- Add blood_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
FROM information_schema.columns
WHERE table_name = 'patients' AND column_name = 'blood_type'
  ) THEN
ALTER TABLE patients ADD COLUMN blood_type VARCHAR
(10);
END
IF;

  -- Add contact_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
FROM information_schema.columns
WHERE table_name = 'patients' AND column_name = 'contact_number'
  ) THEN
ALTER TABLE patients ADD COLUMN contact_number VARCHAR
(20);
END
IF;

  -- Add emergency_contact_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
FROM information_schema.columns
WHERE table_name = 'patients' AND column_name = 'emergency_contact_name'
  ) THEN
ALTER TABLE patients ADD COLUMN emergency_contact_name VARCHAR
(255);
END
IF;

  -- Add emergency_contact_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
FROM information_schema.columns
WHERE table_name = 'patients' AND column_name = 'emergency_contact_number'
  ) THEN
ALTER TABLE patients ADD COLUMN emergency_contact_number VARCHAR
(20);
END
IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;
