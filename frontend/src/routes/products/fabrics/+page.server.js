export async function load({ fetch }) {
  try {
    // ❗ 使用相对路径，自动带 cookie，自动走 /api/products
    const res = await fetch(`/api/products`);

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
