-- CreateTable
CREATE TABLE "Product" (
    "product_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "price" REAL,
    "country" TEXT,
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
    "transportor" TEXT
);
