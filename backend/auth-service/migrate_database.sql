-- Migration to update auth database schema
-- Run this with: psql -U postgres -d tne_authdb -f migrate_database.sql

-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'USER';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Rename email_verified if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'email_verified'
    ) THEN
        -- Migrate data from old column to new column
        UPDATE users SET is_email_verified = email_verified WHERE is_email_verified IS NULL;
        ALTER TABLE users DROP COLUMN email_verified;
    END IF;
END $$;

-- 3. Drop old verification and reset token columns if they exist
ALTER TABLE users DROP COLUMN IF EXISTS verification_token;
ALTER TABLE users DROP COLUMN IF EXISTS reset_password_token;

-- 4. Create enums if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('USER', 'VENDOR', 'ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN
        CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');
    END IF;
END $$;

-- 5. Convert role and status columns to enums
ALTER TABLE users ALTER COLUMN role TYPE "UserRole" USING role::"UserRole";
ALTER TABLE users ALTER COLUMN status TYPE "UserStatus" USING status::"UserStatus";

-- 6. Create refresh_tokens table if not exists
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,
    replaced_by_token TEXT,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create login_history table if not exists
CREATE TABLE IF NOT EXISTS login_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    login_status VARCHAR(20) NOT NULL,
    failure_reason TEXT,
    location JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at);
CREATE INDEX IF NOT EXISTS idx_login_history_login_status ON login_history(login_status);

-- 9. Add unique constraint on email_verification_token
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_verification_token_key;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_verification_token_key ON users(email_verification_token) WHERE email_verification_token IS NOT NULL;

-- 10. Add unique constraint on reset_token
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_reset_token_key;
CREATE UNIQUE INDEX IF NOT EXISTS users_reset_token_key ON users(reset_token) WHERE reset_token IS NOT NULL;

-- Show current schema
\d users
\d refresh_tokens
\d login_history

COMMIT;
