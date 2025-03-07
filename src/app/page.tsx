'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card, Input, Select, Button, Text, Spacer } from '@geist-ui/core';

interface Product {
  product_id: string;
  name: string;
  category: string | null; // Region
  country: string | null;
  price: number | null;
  district: string | null; // District
  sub_district: string | null; // Sub-district
  producer: string | null; // Producer
  varetype: string | null; // Type
  smell: string | null; // Smell
  taste: string | null; // Taste
  farge: string | null; // Color
  metode: string | null; // Method
  inneholder: string | null; // Contains
  emballasjetype: string | null; // Packaging type
  korktype: string | null; // Cork type
  utvalg: string | null; // Selection
  grossist: string | null; // Wholesaler
  transportor: string | null; // Transporter
  imageSmall: string;
  imageMain: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('desc');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const limit = 100;
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(async (reset = false) => {
    if (loading || (!reset && !hasMore)) return;
    setLoading(true);

    try {
      const url = `/api/products?search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${limit}&offset=${reset ? 0 : offset}`;
      console.log('Fetching URL:', url);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      const newProducts = await response.json() as Product[];

      console.log('Fetched products:', newProducts.length, newProducts.map(p => p.price).sort((a, b) => (b || 0) - (a || 0)).slice(0, 5));
      if (!Array.isArray(newProducts)) throw new Error('Response is not an array');

      setProducts(prev => (reset ? newProducts : [...prev, ...newProducts]));
      setOffset(prev => (reset ? limit : prev + limit));
      setHasMore(newProducts.length === limit);
    } catch (error) {
      console.error('Fetch error:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder, offset, hasMore, loading]);

  useEffect(() => {
    fetchProducts(true);
  }, [search, sortBy, sortOrder, fetchProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProducts();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchProducts]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setOffset(0);
  };

  const handleSortChange = (value: string | string[]) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    const [newSortBy, newSortOrder] = selectedValue.split(':');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setOffset(0);
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
        <Input
          placeholder="Search (e.g., Bordeaux)"
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          width="100%"
          style={{ maxWidth: '400px' }}
          clearable crossOrigin={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}        />
        <Select
          placeholder="Sort by"
          value={`${sortBy}:${sortOrder}`}
          onChange={handleSortChange}
          width="200px" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}        >
          <Select.Option value="price:desc">Price: High to Low</Select.Option>
          <Select.Option value="price:asc">Price: Low to High</Select.Option>
          <Select.Option value="name:asc">Name: A-Z</Select.Option>
          <Select.Option value="name:desc">Name: Z-A</Select.Option>
        </Select>
        <Button auto type="success" onClick={toggleViewMode} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          {viewMode === 'grid' ? 'Switch to List' : 'Switch to Grid'}
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {products.map(product => (
            <Card key={product.product_id} hoverable>
              <div style={{ height: '256px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                <Image
                  src={product.imageMain}
                  alt={product.name}
                  width={256}
                  height={256}
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                />
              </div>
              <Card.Content>
                <Text h4 style={{ margin: 0, lineHeight: '1.5' }}>{product.name}</Text>
                <Text small type="secondary">
                  <p>Region: {product.category || 'N/A'}</p>
                  <p>Country: {product.country || 'N/A'}</p>
                  <p>District: {product.district || 'N/A'}</p>
                  <p>Sub-district: {product.sub_district || 'N/A'}</p>
                  <p>Producer: {product.producer || 'N/A'}</p>
                  <p>Type: {product.varetype || 'N/A'}</p>
                  <p>Smell: {product.smell || 'N/A'}</p>
                  <p>Taste: {product.taste || 'N/A'}</p>
                  <p>Color: {product.farge || 'N/A'}</p>
                </Text>
                <Text h5 style={{ marginTop: '8px', color: '#000' }}>
                  Kr {product.price !== null ? product.price.toLocaleString() : 'N/A'}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {products.map(product => (
            <Card key={product.product_id} hoverable>
              <div style={{ height: '256px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                <Image
                  src={product.imageMain}
                  alt={product.name}
                  width={256}
                  height={256}
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                />
              </div>
              <Card.Content>
                <Text h4 style={{ margin: 0, lineHeight: '1.5' }}>{product.name}</Text>
                <Text small type="secondary">
                  <p>Region: {product.category || 'N/A'}</p>
                  <p>Country: {product.country || 'N/A'}</p>
                  <p>District: {product.district || 'N/A'}</p>
                  <p>Sub-district: {product.sub_district || 'N/A'}</p>
                  <p>Producer: {product.producer || 'N/A'}</p>
                  <p>Type: {product.varetype || 'N/A'}</p>
                  <p>Smell: {product.smell || 'N/A'}</p>
                  <p>Taste: {product.taste || 'N/A'}</p>
                  <p>Color: {product.farge || 'N/A'}</p>
                </Text>
                <Text h5 style={{ marginTop: '8px', color: '#000' }}>
                  Kr {product.price !== null ? product.price.toLocaleString() : 'N/A'}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}

      {loading && <Text p style={{ textAlign: 'center', marginTop: '32px' }}>Loading...</Text>}
      {hasMore && <div ref={loaderRef} style={{ height: '80px' }} />}
      {!hasMore && products.length > 0 && (
        <Text p style={{ textAlign: 'center', marginTop: '32px' }}>No more products to load.</Text>
      )}
      {products.length === 0 && !loading && (
        <Text p style={{ textAlign: 'center', marginTop: '32px' }}>No products found. Try a different search term.</Text>
      )}
    </div>
  );
}