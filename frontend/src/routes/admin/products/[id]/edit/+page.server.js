// src/routes/admin/products/[id]/edit/+page.server.js
import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals, fetch, cookies }) {
  const user = locals.authUser;
  if (!user || user.type !== 'staff') {
    throw error(403, 'Forbidden');
  }

  const { id } = params;

  const productRes = await api.products.get({ fetch, cookies }, id);
  const product = productRes.product ?? productRes;

  if (!product) throw error(404, 'Product not found');

  const categoriesRes = await api.products.listCategories({ fetch, cookies });
  const categories = categoriesRes.categories ?? [];

  return {
    product,
    categories,
    error: null,
    success: false,
    values: null
  };
}


export const actions = {
  default: async ({ params, request, locals, fetch, cookies }) => {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
      throw error(403, 'Forbidden');
    }

    const { id } = params;
    const form = await request.formData();
    const payload = Object.fromEntries(form);

    console.log("📝 Incoming:", payload);

    // 数字清洗
    const cleanPayload = {
      ...payload,
      base_price: payload.base_price ? parseFloat(payload.base_price) : null,
      category_id: payload.category_id ? parseInt(payload.category_id) : null
    };

    // -------- 自动 product_type 推断 --------
    const categoriesRes = await api.products.listCategories({ fetch, cookies });
    const allCats = categoriesRes.categories ?? [];

    const fabricCat = allCats.find(c => c.code === 'fabric');
    const garmentCat = allCats.find(c => c.code === 'garment');

    let finalType = cleanPayload.product_type;

    const catId = cleanPayload.category_id;

    if (!finalType) {
      if (fabricCat && catId === fabricCat.id) finalType = "fabric";
      else if (garmentCat) {
        const children = allCats.filter(c => c.parent_id === garmentCat.id);
        if (children.find(c => c.id === catId)) finalType = "garment";
      }
    }

    if (!finalType) finalType = "garment";

    cleanPayload.product_type = finalType;

    console.log("➡ Final payload:", cleanPayload);

    try {
      const res = await api.products.update({ fetch, cookies }, id, cleanPayload);
      if (res.error) {
        return { success: false, error: res.error, values: payload };
      }
      return { success: true, error: null, values: cleanPayload };
    } catch (err) {
      return { success: false, error: err.message, values: payload };
    }
  }
};
