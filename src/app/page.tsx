const [loading, setLoading] = useState(false);
const fetchProducts = async () => {
  setLoading(true);
  const params = new URLSearchParams({ search, category, country });
  const res = await fetch(`/api/products?${params}`);
  const data = await res.json();
  setProducts(data);
  setLoading(false);
};