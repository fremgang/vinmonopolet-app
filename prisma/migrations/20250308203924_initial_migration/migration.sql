-- CreateTable
CREATE TABLE "products" (
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "country" TEXT,
    "price" INTEGER,
    "district" TEXT,
    "sub_district" TEXT,
    "producer" TEXT,
    "varetype" TEXT,
    "lukt" TEXT,
    "smak" TEXT,
    "farge" TEXT,
    "metode" TEXT,
    "inneholder" TEXT,
    "emballasjetype" TEXT,
    "korktype" TEXT,
    "utvalg" TEXT,
    "grossist" TEXT,
    "transportor" TEXT,
    "imageSmall" TEXT,
    "imageMain" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_country_idx" ON "products"("country");

-- CreateIndex
CREATE INDEX "products_price_idx" ON "products"("price");

-- CreateIndex
CREATE INDEX "products_country_category_idx" ON "products"("country", "category");
