export async function load({ fetch }) {
  try {
    // 1. Fetch categories
    const catRes = await fetch('/api/products/categories');
    const catData = catRes.ok ? await catRes.json() : { categories: [] };
    const categories = catData.categories ?? [];

    const mensCat = categories.find(c => c.code === 'mens');
    if (!mensCat) {
      console.error("Mens category not found");
      return { products: [], categoryName: "Men" };
    }

    // 2. Fetch all products
    const prodRes = await fetch('/api/products');
    if (!prodRes.ok) {
      return { products: [], categoryName: mensCat.name };
    }

    const data = await prodRes.json();
    const all = data.products ?? [];

    // 3. Filter
    const products = all.filter(
      p => p.product_type === 'garment' && p.category_id === mensCat.id
    );

    return {
      products,
      categoryName: mensCat.name
    };

  } catch (err) {
    console.error("Error loading men's garments:", err);
    return { products: [], categoryName: "Men" };
  }
}
