'use client';

import { useState, useEffect } from 'react';

interface Product {
  product_id: string;
  name: string;
  category: string | null;
  price: number | null;
  country: string | null;
  district: string | null;
  sub_district: string | null;
  producer: string | null;
  varetype: string | null;
  lukt: string | null;
  smak: string | null;
  farge: string | null;
  metode: string | null;
  inneholder: string | null;
  emballasjetype: string | null;
  korktype: string | null;
  utvalg: string | null;
  grossist: string | null;
  transportor: string | null;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search, category, country, priceMin, priceMax]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(category && { category }),
        ...(country && { country }),
        ...(priceMin && { priceMin }),
        ...(priceMax && { priceMax }),
      });
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Vinmonopolet Products</h1>

      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Filter by category (e.g., Rødvin)..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Filter by country..."
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <div className="flex space-x-4">
          <input
            type="number"
            placeholder="Min price (Kr)"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Max price (Kr)"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.product_id} className="border p-4 rounded shadow">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p><strong>ID:</strong> {product.product_id}</p>
                <p><strong>Category:</strong> {product.category || 'N/A'}</p>
                <p><strong>Price:</strong> {product.price ? `Kr ${product.price.toFixed(2)}` : 'N/A'}</p>
                <p><strong>Country:</strong> {product.country || 'N/A'}</p>
                <p><strong>Producer:</strong> {product.producer || 'N/A'}</p>
                <p><strong>Smak:</strong> {product.smak || 'N/A'}</p>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full">No products found</p>
          )}
        </div>
      )}
    </div>
  );
}