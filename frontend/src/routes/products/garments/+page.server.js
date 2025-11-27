export async function load({ fetch }) {
  try {
    const res = await fetch('/api/products');

    if (!res.ok) {
      console.error("Failed to load products:", res.status);
      return { garments: [] };
    }

    const data = await res.json();
    const all = data.products ?? [];

    const garments = all.filter(p => p.product_type === 'garment');

    return { garments };

  } catch (err) {
    console.error("Error loading garments:", err);
    return { garments: [] };
  }
}

