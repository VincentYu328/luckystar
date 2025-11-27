export async function load({ fetch }) {
  try {
    // 1. 获取所有分类（正确路径）
    const catRes = await fetch(`/api/products/categories`);
    const catData = catRes.ok ? await catRes.json() : { categories: [] };
    const categories = catData.categories ?? [];

    // 找出 boys 分类
    const boysCat = categories.find(c => c.code === 'boys');
    if (!boysCat) {
      console.error("Boys category not found");
      return { products: [], categoryName: "Boys" };
    }

    // 2. 获取所有产品
    const prodRes = await fetch(`/api/products`);
    if (!prodRes.ok) {
      return { products: [], categoryName: "Boys" };
    }

    const data = await prodRes.json();
    const all = data.products ?? [];

    // 3. 过滤男童装
    const products = all.filter(
      p => p.product_type === 'garment' && p.category_id === boysCat.id
    );

    return {
      products,
      categoryName: boysCat.name || "Boys"
    };

  } catch (err) {
    console.error("Error loading boys garments:", err);
    return { products: [], categoryName: "Boys" };
  }
}
