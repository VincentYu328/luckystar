export async function load({ fetch, params }) {
  const id = Number(params.id);

  try {
    // 1. 获取产品信息（必须加 /api）
    const prodRes = await fetch(`/api/products/${id}`);
    if (!prodRes.ok) {
      return { product: null, images: [], invalid: true };
    }
    const product = await prodRes.json();

    // 必须是成衣
    if (product.product_type !== 'garment') {
      return { product: null, images: [], invalid: true };
    }

    // 2. 获取分类信息
    const catRes = await fetch(`/api/products/categories`);
    const catData = catRes.ok ? await catRes.json() : { categories: [] };
    const categories = catData.categories ?? [];

    const boysCat = categories.find(c => c.code === 'boys');

    // 必须匹配 boys 子分类
    if (!boysCat || product.category_id !== boysCat.id) {
      return { product: null, images: [], invalid: true };
    }

    // 3. 获取产品图片
    const imgRes = await fetch(`/api/products/${id}/images`);
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
