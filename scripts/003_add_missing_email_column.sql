DO $
$ 
BEGIN
    IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'email'
  ) THEN
    ALTER TABLE patients ADD COLUMN email VARCHAR
    (255);
END
IF;
END $$;