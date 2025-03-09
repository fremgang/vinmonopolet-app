-- Basic indexes for common fields used in searches
CREATE INDEX IF NOT EXISTS "products_district_idx" ON "products"("district");
CREATE INDEX IF NOT EXISTS "products_producer_idx" ON "products"("producer");

-- Composite indexes for common search patterns
CREATE INDEX IF NOT EXISTS "products_category_price_idx" ON "products"("category", "price");
CREATE INDEX IF NOT EXISTS "products_name_country_idx" ON "products"("name", "country");

-- Enable trigram extension for improved text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add trigram indexes for better text search performance
CREATE INDEX IF NOT EXISTS "products_name_trgm_idx" ON "products" USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "products_lukt_trgm_idx" ON "products" USING GIN (lukt gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "products_smak_trgm_idx" ON "products" USING GIN (smak gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "products_district_trgm_idx" ON "products" USING GIN (district gin_trgm_ops);