-- CreateMigration
-- Name: fix_price_column_type
-- Description: Update price column to use BIGINT instead of INTEGER

-- Step 1: Alter the column type
ALTER TABLE products ALTER COLUMN price TYPE BIGINT;

-- Step 2: Create/update index
CREATE INDEX IF NOT EXISTS products_price_idx ON products(price);
