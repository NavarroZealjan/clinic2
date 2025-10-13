-- Add missing gender and emergency_contact_number columns

DO $
$
BEGIN
    -- Add gender column if it doesn't exist
    IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'gender'
  ) THEN
    ALTER TABLE patients ADD COLUMN gender VARCHAR
    (10);
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
