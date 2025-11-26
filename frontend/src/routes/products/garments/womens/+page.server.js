import { API_BASE } from '$lib/server/api.js';

export async function load({ fetch }) {
  try {
    // 1. Fetch all categories
    const catRes = await fetch(`${API_BASE}/products/categories`);
    const catData = catRes.ok ? await catRes.json() : { categories: [] };
    const categories = catData.categories ?? [];

    // Locate the "womens" category
    const womensCat = categories.find(c => c.code === 'womens');
    if (!womensCat) {
      console.error("Womens category not found");
      return { products: [], categoryName: "Women" };
    }

    // 2. Fetch all products
    const prodRes = await fetch(`${API_BASE}/products`);
    if (!prodRes.ok) {
      return { products: [], categoryName: womensCat.name || "Women" };
    }

    const data = await prodRes.json();
    const all = data.products ?? [];

    // 3. Filter: garments under womens category
    const products = all.filter(
      p => p.product_type === 'garment' && p.category_id === womensCat.id
    );

    return {
      products,
      categoryName: womensCat.name || "Women"
    };

  } catch (err) {
    console.error("Error loading women's garments:", err);
    return { products: [], categoryName: "Women" };
  }
}
