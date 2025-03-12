// src/app/api/products/fallback/route.ts
// Create this file to serve static data when DB is unavailable
import { NextResponse } from 'next/server';

// Sample data based on your CSV data
const sampleData = {
  products: [
    {
      "product_id": "1101",
      "name": "Løiten Linie",
      "category": "Brennevin - Akevitt - Akevitt, brun",
      "price": 469,
      "country": "Norge",
      "district": "Akershus",
      "sub_district": "Nittedal",
      "producer": "Arcus",
      "varetype": "Brennevin - Akevitt - Akevitt, brun",
      "lukt": "Aroma med tydelig preg av karve og anis, innslag av fat, vanilje og tørket appelsinskall.",
      "smak": "Karvepreget og sammensatt med god fylde, innslag av anis, sitrus, fat og vanilje. God lengde.",
      "farge": "Middels dyp gyllengul.",
      "metode": "16 md på fat.",
      "inneholder": null,
      "emballasjetype": "Glass, Klimasmart",
      "korktype": "Skrukapsel",
      "utvalg": "Basisutvalget",
      "grossist": "Arcus Norway AS",
      "transportor": "Vectura AS",
      "imageSmall": "https://bilder.vinmonopolet.no/cache/300x300-0/1101-1.jpg",
      "imageMain": "https://bilder.vinmonopolet.no/cache/515x515-0/1101-1.jpg"
    },
    {
      "product_id": "1201",
      "name": "Gilde Non Plus Ultra",
      "category": "Brennevin - Akevitt - Akevitt, brun",
      "price": 634,
      "country": "Norge",
      "district": null,
      "sub_district": null,
      "producer": "Arcus",
      "varetype": "Brennevin - Akevitt - Akevitt, brun",
      "lukt": "Aroma med fint preg av karve, sitrus og blomst over innslag av fat.",
      "smak": "Fint preg av karve, sitrus og integrert fat. God fylde og lengde.",
      "farge": "Middels dyp gyllengul.",
      "metode": "Potetsprit blandet med krydderdestillater og -uttrekk, før tapping ble akevitten fatmodnet i 12 år.",
      "inneholder": null,
      "emballasjetype": "Glass",
      "korktype": "Naturkork",
      "utvalg": "Bestillingsutvalget",
      "grossist": "Arcus Norway AS",
      "transportor": "Vectura AS",
      "imageSmall": "https://bilder.vinmonopolet.no/cache/300x300-0/1201-1.jpg",
      "imageMain": "https://bilder.vinmonopolet.no/cache/515x515-0/1201-1.jpg"
    },
    {
      "product_id": "1301",
      "name": "Aalborg Taffel Akvavit",
      "category": "Brennevin - Akevitt - Akevitt, blank",
      "price": 409,
      "country": "Danmark",
      "district": null,
      "sub_district": null,
      "producer": "Arcus Denmark, Danske Spritfabr.",
      "varetype": "Brennevin - Akevitt - Akevitt, blank",
      "lukt": "Tydelig og fokusert aroma av karve, streif av sitrusaktige toner, anis og dill.",
      "smak": "Karvepreget med god fylde og lengde, undertoner av appelsin, litt lakris, dill og fennikel.",
      "farge": "Vannklar.",
      "metode": "Produsert i Norge.",
      "inneholder": null,
      "emballasjetype": "Glass, Klimasmart",
      "korktype": "Skrukapsel",
      "utvalg": "Basisutvalget",
      "grossist": "Arcus Norway AS",
      "transportor": "Vectura AS",
      "imageSmall": "https://bilder.vinmonopolet.no/cache/300x300-0/1301-1.jpg",
      "imageMain": "https://bilder.vinmonopolet.no/cache/515x515-0/1301-1.jpg"
    },
    {
      "product_id": "1302",
      "name": "Aalborg Taffel Akvavit",
      "category": "Brennevin - Akevitt - Akevitt, blank",
      "price": 244,
      "country": "Danmark",
      "district": null,
      "sub_district": null,
      "producer": "Arcus Denmark, Danske Spritfabr.",
      "varetype": "Brennevin - Akevitt - Akevitt, blank",
      "lukt": "Tydelig og fokusert aroma av karve, streif av sitrusaktige toner, anis og dill.",
      "smak": "Karvepreget med god fylde og lengde, undertoner av appelsin, litt lakris, dill og fennikel.",
      "farge": "Vannklar.",
      "metode": "Produsert i Norge.",
      "inneholder": null,
      "emballasjetype": "Glass",
      "korktype": "Skrukapsel",
      "utvalg": "Bestillingsutvalget",
      "grossist": "Arcus Norway AS",
      "transportor": "Vectura AS",
      "imageSmall": "https://bilder.vinmonopolet.no/cache/300x300-0/1302-1.jpg",
      "imageMain": "https://bilder.vinmonopolet.no/cache/515x515-0/1302-1.jpg"
    },
    {
      "product_id": "473",
      "name": "Gjenbruksnett i resirkulert bomull",
      "category": "Gaveartikler og tilbehør - Handleposer",
      "price": 89,
      "country": null,
      "district": null,
      "sub_district": null,
      "producer": null,
      "varetype": "Gaveartikler og tilbehør - Handleposer",
      "lukt": null,
      "smak": null,
      "farge": null,
      "metode": null,
      "inneholder": null,
      "emballasjetype": null,
      "korktype": null,
      "utvalg": null,
      "grossist": null,
      "transportor": null,
      "imageSmall": "https://bilder.vinmonopolet.no/cache/300x300-0/473-1.jpg",
      "imageMain": "https://bilder.vinmonopolet.no/cache/515x515-0/473-1.jpg"
    }
  ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parse parameters
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '50')));
  const random = searchParams.get('random') === 'true';
  
  console.log("Fallback API called with:", { page, limit, random });
  
  // Calculate pagination
  const startIdx = (page - 1) * limit;
  const endIdx = Math.min(startIdx + limit, sampleData.products.length);
  
  // Get data slice (clone array to avoid modifying original)
  let productsSlice = [...sampleData.products];
  
  // Handle random sorting
  if (random) {
    productsSlice = productsSlice.sort(() => Math.random() - 0.5);
  }

  // Apply pagination
  productsSlice = productsSlice.slice(startIdx, endIdx);
  
  // Return the response
  return NextResponse.json({
    products: productsSlice,
    pagination: {
      total: sampleData.products.length,
      page,
      limit,
      pages: Math.ceil(sampleData.products.length / limit),
      hasMore: endIdx < sampleData.products.length
    }
  }, { 
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600'
    }
  });
}