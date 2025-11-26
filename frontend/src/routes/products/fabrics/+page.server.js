import { API_BASE } from '$lib/server/api.js';

export async function load({ fetch }) {
  try {
    const res = await fetch(`${API_BASE}/products`);

    if (!res.ok) {
      console.error("Failed to load products:", res.status);
      return { fabrics: [] };
    }

    const data = await res.json();   // { count, products }
    const all = data.products ?? [];

    // 过滤布料
    const fabrics = all.filter(p => p.product_type === 'fabric');

    return { fabrics };

  } catch (err) {
    console.error("Error loading fabrics:", err);
    return { fabrics: [] };
  }
}
