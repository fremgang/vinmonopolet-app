const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("prisma/products.db");
const data = JSON.parse(fs.readFileSync("products.json", "utf8")).products;

db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS products`);
  db.run(`
    CREATE TABLE products (
      product_id TEXT PRIMARY KEY,
      name TEXT,
      category TEXT,
      price INTEGER,
      country TEXT,
      district TEXT,
      sub_district TEXT,
      producer TEXT,
      varetype TEXT,
      lukt TEXT,
      smak TEXT,
      farge TEXT,
      metode TEXT,
      inneholder TEXT,
      emballasjetype TEXT,
      korktype TEXT,
      utvalg TEXT,
      grossist TEXT,
      transportor TEXT
    )
  `);

  const stmt = db.prepare(`
    INSERT INTO products (product_id, name, category, price, country, district, sub_district, producer, varetype, lukt, smak, farge, metode, inneholder, emballasjetype, korktype, utvalg, grossist, transportor)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  data.forEach((product) => {
    stmt.run([
      product.product_id,
      product.name,
      product.category,
      product.price,
      product.country,
      product.district,
      product.sub_district,
      product.producer,
      product.varetype,
      product.lukt,
      product.smak,
      product.farge,
      product.metode,
      product.inneholder,
      product.emballasjetype,
      product.korktype,
      product.utvalg,
      product.grossist,
      product.transportor,
    ]);
  });

  stmt.finalize();
  db.close(() => console.log("Import complete"));
});
