-- Add role column to users table
ALTER TABLE users ADD COLUMN role INTEGER NOT NULL DEFAULT 1;

-- Create index for role column
CREATE INDEX idx_users_role ON users(role);

-- Update existing users to be sellers (role = 1)
UPDATE users SET role = 1 WHERE role IS NULL; 