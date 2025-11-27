export async function load({ fetch, params }) {
  const id = Number(params.id);

  try {
    // 1. 产品详情
    const prodRes = await fetch(`/api/products/${id}`);
    if (!prodRes.ok) {
      return { product: null, images: [], stock: null, invalid: true };
    }
    const product = await prodRes.json();

    // 2. 产品图片
    const imgRes = await fetch(`/api/products/${id}/images`);
    const imgData = imgRes.ok ? await imgRes.json() : { images: [] };
    const images = imgData.images ?? [];

    // 3. Fabric stock
    let stock = null;
    if (product.product_type === 'fabric') {
      const stockRes = await fetch(`/api/products/fabric/stock`);
      if (stockRes.ok) {
        const stockData = await stockRes.json();
        const list = stockData.stock ?? [];
        stock = list.find(s => s.fabric_id === id) || null;
      }
    }

    return {
      product,
      images,
      stock,
      invalid: false
    };

  } catch (err) {
    console.error("Error loading product detail:", err);
    return { product: null, images: [], stock: null, invalid: true };
  }
}
