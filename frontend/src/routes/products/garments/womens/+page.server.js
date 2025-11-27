// src/routes/products/garments/womens/+page.server.js
export async function load({ fetch }) {
  try {
    // 1. 取分类：直接走 /api
    const catRes = await fetch('/api/products/categories');
    const catData = catRes.ok ? await catRes.json() : { categories: [] };
    const categories = catData.categories ?? [];

    const womensCat = categories.find(c => c.code === 'womens');
    if (!womensCat) {
      console.error("Womens category not found");
      return { products: [], categoryName: "Women" };
    }

    // 2. 取产品列表
    const prodRes = await fetch('/api/products');
    const data = prodRes.ok ? await prodRes.json() : { products: [] };
    const all = data.products ?? [];

    // 3. 过滤子分类
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
