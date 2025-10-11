-- Users table for authentication
CREATE TABLE
IF NOT EXISTS users
(
  id SERIAL PRIMARY KEY,
  username VARCHAR
(100) UNIQUE NOT NULL,
  password VARCHAR
(255) NOT NULL,
  role VARCHAR
(20) NOT NULL CHECK
(role IN
('admin', 'staff', 'doctor')),
  full_name VARCHAR
(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users (passwords are plain text for testing)
-- In production, use bcrypt to hash passwords
INSERT INTO users
  (username, password, role, full_name)
VALUES
  ('zealjan', '$2a$10$pYxWldCD5Tpdxg9lllCOmOxeBQ5i2xxLwGR/vj3yJ6N6RSET8NGeG', 'admin', 'Zealjan Admin'),
  ('staff1', 'password123', 'staff', 'Staff Member'),
  ('zealjan@gmail.com', 'capstone2', 'admin', 'Zealjan Admin'),
  ('datan@gmail.com', 'capstone2', 'staff', 'Datan Staff')
ON CONFLICT
(username) DO NOTHING;
