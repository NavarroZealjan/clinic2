-- Create notifications table for in-app notifications
CREATE TABLE
IF NOT EXISTS notifications
(
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  appointment_id INTEGER,
  title VARCHAR
(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR
(50) DEFAULT 'info', -- info, success, warning, error
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY
(appointment_id) REFERENCES appointments
(id) ON
DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX
IF NOT EXISTS idx_notifications_user_id ON notifications
(user_id);
CREATE INDEX
IF NOT EXISTS idx_notifications_is_read ON notifications
(is_read);
