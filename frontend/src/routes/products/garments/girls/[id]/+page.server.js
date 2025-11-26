import { API_BASE } from '$lib/server/api.js';

export async function load({ fetch, params }) {
  const id = params.id;

  try {
    // 1. Fetch product
    const prodRes = await fetch(`${API_BASE}/products/${id}`);
    if (!prodRes.ok) {
      return { status: prodRes.status, error: new Error("Product not found") };
    }
    const product = await prodRes.json();

    // Must be a garment
    if (product.product_type !== 'garment') {
      return { product: null, images: [], invalid: true };
    }

    // 2. Fetch categories
    const catRes = await fetch(`${API_BASE}/products/categories`);
    const catData = catRes.ok ? await catRes.json() : { categories: [] };
    const categories = catData.categories ?? [];

    // Girls category
    const girlsCat = categories.find(c => c.code === 'girls');

    // Must belong to girls
    if (!girlsCat || product.category_id !== girlsCat.id) {
      return { product: null, images: [], invalid: true };
    }

    // 3. Fetch product images
    const imgRes = await fetch(`${API_BASE}/products/${id}/images`);
    const imagesData = imgRes.ok ? await imgRes.json() : { images: [] };
    const images = imagesData.images ?? [];

    return {
      product,
      images,
      invalid: false
    };

  } catch (err) {
    console.error("Error loading girls garment detail:", err);
    return { product: null, images: [], invalid: true };
  }
}
