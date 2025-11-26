import { API_BASE } from '$lib/server/api.js';

export async function load({ fetch, params }) {
  const id = params.id;

  try {
    // 1. 获取产品信息
    const prodRes = await fetch(`${API_BASE}/products/${id}`);
    if (!prodRes.ok) {
      return { status: prodRes.status, error: new Error("Product not found") };
    }
    const product = await prodRes.json();

    // 校验：必须是 garment 且属于 boys 类别
    if (product.product_type !== 'garment') {
      return { product: null, images: [], invalid: true };
    }

    // 2. 获取分类信息
    const catRes = await fetch(`${API_BASE}/products/categories`);
    const catData = catRes.ok ? await catRes.json() : { categories: [] };
    const categories = catData.categories ?? [];
    const boysCat = categories.find(c => c.code === 'boys');

    if (!boysCat || product.category_id !== boysCat.id) {
      return { product: null, images: [], invalid: true };
    }

    // 3. 获取产品图片
    const imgRes = await fetch(`${API_BASE}/products/${id}/images`);
    const imagesData = imgRes.ok ? await imgRes.json() : { images: [] };
    const images = imagesData.images ?? [];

    return {
      product,
      images,
      invalid: false
    };

  } catch (err) {
    console.error("Error loading boys garment detail:", err);
    return { product: null, images: [], invalid: true };
  }
}
