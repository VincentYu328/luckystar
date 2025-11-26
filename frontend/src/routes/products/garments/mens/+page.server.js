import { API_BASE } from '$lib/server/api.js';

export async function load({ fetch }) {
  try {
    // 1. Fetch all categories
    const catRes = await fetch(`${API_BASE}/products/categories`);
    const catData = catRes.ok ? await catRes.json() : { categories: [] };
    const categories = catData.categories ?? [];

    // Locate the "mens" category
    const mensCat = categories.find(c => c.code === 'mens');
    if (!mensCat) {
      console.error("Mens category not found");
      return { products: [], categoryName: "Men" };
    }

    // 2. Fetch all products
    const prodRes = await fetch(`${API_BASE}/products`);
    if (!prodRes.ok) {
      return { products: [], categoryName: "Men" };
    }

    const data = await prodRes.json();
    const all = data.products ?? [];

    // 3. Filter men's garments
    const products = all.filter(
      p => p.product_type === 'garment' && p.category_id === mensCat.id
    );

    return {
      products,
      categoryName: mensCat.name || "Men"
    };

  } catch (err) {
    console.error("Error loading men's garments:", err);
    return { products: [], categoryName: "Men" };
  }
}
