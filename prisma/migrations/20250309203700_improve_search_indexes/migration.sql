-- CreateIndex
CREATE INDEX "products_district_idx" ON "products"("district");

-- CreateIndex
CREATE INDEX "products_producer_idx" ON "products"("producer");

-- CreateIndex
CREATE INDEX "products_category_price_idx" ON "products"("category", "price");

-- CreateIndex
CREATE INDEX "products_name_country_idx" ON "products"("name", "country");
