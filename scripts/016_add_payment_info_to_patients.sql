-- Add payment information columns to patients table
ALTER TABLE patients ADD COLUMN
IF NOT EXISTS payment_method VARCHAR
(50);
ALTER TABLE patients ADD COLUMN
IF NOT EXISTS payment_number VARCHAR
(50);
ALTER TABLE patients ADD COLUMN
IF NOT EXISTS payment_number_name VARCHAR
(100);

-- Create index for faster lookups
CREATE INDEX
IF NOT EXISTS idx_patients_payment_method ON patients
(payment_method);

-- Add comment for documentation
COMMENT ON COLUMN patients.payment_method IS 'Payment method: GCash, Maya, Bank Transfer, etc.';
COMMENT ON COLUMN patients.payment_number IS 'Account/phone number for the payment method';
COMMENT ON COLUMN patients.payment_number_name IS 'Name associated with the payment account';
