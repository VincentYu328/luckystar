export async function load({ fetch, params }) {
  const id = params.id;

  try {
    // 1. Fetch product (必须加 /api)
    const prodRes = await fetch(`/api/products/${id}`);
    if (!prodRes.ok) {
      return { product: null, images: [], invalid: true };
    }
    const product = await prodRes.json();

    // 必须是成衣
    if (product.product_type !== 'garment') {
      return { product: null, images: [], invalid: true };
    }

    // 2. 获取分类
    const catRes = await fetch(`/api/products/categories`);
    const catData = catRes.ok ? await catRes.json() : { categories: [] };
    const categories = catData.categories ?? [];

    // 找 girls 分类
    const girlsCat = categories.find(c => c.code === 'girls');

    // 必须属于 girls
    if (!girlsCat || product.category_id !== girlsCat.id) {
      return { product: null, images: [], invalid: true };
    }

    // 3. 图片
    const imgRes = await fetch(`/api/products/${id}/images`);
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
