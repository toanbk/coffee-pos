 -- Add token-related fields to users table
ALTER TABLE users 
ADD COLUMN last_login DATETIME NULL,
ADD COLUMN token_expires_at DATETIME NULL;

-- Create indexes for new fields
CREATE INDEX idx_users_last_login ON users(last_login);
CREATE INDEX idx_users_token_expires_at ON users(token_expires_at);