export async function load({ fetch, params }) {
  const id = Number(params.id);

  try {
    // 1. Fetch product detail
    const prodRes = await fetch(`/api/products/${id}`);
    if (!prodRes.ok) {
      return { product: null, images: [], invalid: true };
    }
    const product = await prodRes.json();

    // 必须是成衣
    if (!product || product.product_type !== 'garment') {
      return { product: null, images: [], invalid: true };
    }

    // 2. Fetch categories检查是否属于 womens
    const catRes = await fetch(`/api/products/categories`);
    const catData = catRes.ok ? await catRes.json() : { categories: [] };
    const categories = catData.categories ?? [];
    const womensCat = categories.find(c => c.code === 'womens');

    if (!womensCat || product.category_id !== womensCat.id) {
      return { product: null, images: [], invalid: true };
    }

    // 3. Fetch images
    const imgRes = await fetch(`/api/products/${id}/images`);
    const imgData = imgRes.ok ? await imgRes.json() : { images: [] };
    const images = imgData.images ?? [];

    return {
      product,
      images,
      invalid: false
    };

  } catch (err) {
    console.error("Error loading women's garment detail:", err);
    return { product: null, images: [], invalid: true };
  }
}
