import { API_BASE } from '$lib/server/api.js';

export async function load({ fetch, params }) {
  const id = Number(params.id);

  try {
    // 1. Fetch product detail
    const prodRes = await fetch(`${API_BASE}/products/${id}`);
    if (!prodRes.ok) {
      return { product: null, images: [], stock: null, invalid: true };
    }
    const product = await prodRes.json();

    // 2. Fetch product images
    const imgRes = await fetch(`${API_BASE}/products/${id}/images`);
    const imgData = imgRes.ok ? await imgRes.json() : { images: [] };
    const images = imgData.images ?? [];

    // 3. If fabric → load stock
    let stock = null;
    if (product.product_type === 'fabric') {
      const stockRes = await fetch(`${API_BASE}/products/fabric/stock`);
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
