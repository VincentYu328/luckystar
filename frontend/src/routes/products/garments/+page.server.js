import { API_BASE } from '$lib/server/api.js';

export async function load({ fetch }) {
  try {
    const res = await fetch(`${API_BASE}/products`);

    if (!res.ok) {
      console.error("Failed to load products:", res.status);
      return { garments: [] };
    }

    const data = await res.json();  // { count, products }
    const all = data.products ?? [];

    // 过滤 product_type = garment
    const garments = all.filter(p => p.product_type === 'garment');

    return { garments };

  } catch (err) {
    console.error("Error loading garments:", err);
    return { garments: [] };
  }
}
