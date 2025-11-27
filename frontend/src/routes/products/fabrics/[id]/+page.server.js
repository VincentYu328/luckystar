export async function load({ fetch, params }) {
  const id = params.id;

  try {
    // 1. 产品信息
    const prodRes = await fetch(`/api/products/${id}`);
    if (!prodRes.ok) {
      return { status: prodRes.status, error: new Error("Product not found") };
    }
    const product = await prodRes.json();

    // 2. 产品图片
    const imgRes = await fetch(`/api/products/${id}/images`);
    const imagesData = imgRes.ok ? await imgRes.json() : { images: [] };
    const images = imagesData.images ?? [];

    // 3. 布料库存（总列表 → filter）
    const stockRes = await fetch(`/api/products/fabric/stock`);
    let stock = null;

    if (stockRes.ok) {
      const stockData = await stockRes.json();
      const allStock = stockData.stock ?? [];
      stock = allStock.find(s => s.fabric_id == id) || null;
    }

    return {
      product,
      images,
      stock
    };

  } catch (err) {
    console.error("Error loading fabric detail:", err);
    return { product: null, images: [], stock: null };
  }
}

