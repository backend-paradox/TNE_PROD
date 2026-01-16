-- Manual SQL to create tour_package_reviews table
-- Run this in your PostgreSQL database client (pgAdmin, psql, etc.)

CREATE TABLE IF NOT EXISTS tour_package_reviews (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  package_id VARCHAR(255) NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  helpful INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS tour_package_reviews_package_id_idx ON tour_package_reviews(package_id);
CREATE INDEX IF NOT EXISTS tour_package_reviews_user_id_idx ON tour_package_reviews(user_id);

-- Verify the table was created
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tour_package_reviews'
ORDER BY ordinal_position;
