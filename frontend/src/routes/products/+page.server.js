import { API_BASE } from '$lib/server/api.js';

export async function load({ fetch }) {
  try {
    const res = await fetch(`${API_BASE}/api/products/categories`);

    if (!res.ok) {
      console.error("Failed to fetch product categories:", res.status);
      return { categories: [] };
    }

    const data = await res.json();
    const flat = data.categories;

    const map = new Map();
    flat.forEach(cat => map.set(cat.id, { ...cat, children: [] }));

    const roots = [];

    flat.forEach(cat => {
      if (cat.parent_id) {
        const parent = map.get(cat.parent_id);
        if (parent) parent.children.push(map.get(cat.id));
      } else {
        roots.push(map.get(cat.id));
      }
    });

    return { categories: roots };

  } catch (err) {
    console.error("Error while loading products:", err);
    return { categories: [] };
  }
}
