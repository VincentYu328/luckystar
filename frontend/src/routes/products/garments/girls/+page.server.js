import { API_BASE } from '$lib/server/api.js';

export async function load({ fetch }) {
  try {
    // 1. 获取所有分类
    const catRes = await fetch(`${API_BASE}/products/categories`);
    const catData = catRes.ok ? await catRes.json() : { categories: [] };
    const categories = catData.categories ?? [];

    // 找到 girls 分类
    const girlsCat = categories.find(c => c.code === 'girls');
    if (!girlsCat) {
      console.error("Girls category not found");
      return { products: [], categoryName: "Girls" };
    }

    // 2. 获取所有产品
    const prodRes = await fetch(`${API_BASE}/products`);
    if (!prodRes.ok) {
      return { products: [], categoryName: "Girls" };
    }

    const data = await prodRes.json();
    const all = data.products ?? [];

    // 3. 过滤女童装
    const products = all.filter(
      p => p.product_type === 'garment' && p.category_id === girlsCat.id
    );

    return {
      products,
      categoryName: girlsCat.name || "Girls"
    };

  } catch (err) {
    console.error("Error loading girls garments:", err);
    return { products: [], categoryName: "Girls" };
  }
}
