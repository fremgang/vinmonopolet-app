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
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 50;

const [loading, setLoading] = useState(false);
const fetchProducts = async () => {
  setLoading(true);
  const params = new URLSearchParams({ search, category, country, page: page.toString() });
  const res = await fetch(`/api/products?${params}`);
  const { products, total } = await res.json();
  setProducts(products);
  setTotal(total);
  setLoading(false);
};

  useEffect(() => {
    fetchProducts();
  }, [search, category, country, page]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Vinmonopolet Products</h1>

      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Filter by category..."
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Filter by country..."
          value={country}
          onChange={(e) => { setCountry(e.target.value); setPage(1); }}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.product_id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p><strong>ID:</strong> {product.product_id}</p>
            <p><strong>Category:</strong> {product.category || 'N/A'}</p>
            <p><strong>Price:</strong> {product.price ? `Kr ${product.price.toFixed(2)}` : 'N/A'}</p>
            <p><strong>Country:</strong> {product.country || 'N/A'}</p>
            <p><strong>Producer:</strong> {product.producer || 'N/A'}</p>
            <p><strong>Smak:</strong> {product.smak || 'N/A'}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <p>Page {page} of {totalPages}</p>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}