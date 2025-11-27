// src/routes/admin/products/create/+page.server.js
import { api } from '$lib/server/api.js';
import { redirect, error } from '@sveltejs/kit';

export async function load({ locals, fetch, cookies }) {
  const user = locals.authUser;
  if (!user || user.type !== 'staff') {
    throw error(403, 'Forbidden');
  }

  // 获取分类
  const categoriesRes = await api.products.listCategories({ fetch, cookies });
  const allCategories = categoriesRes.categories ?? [];

  // 子分类 = mens / womens / boys / girls（成衣）
  const childCategories = allCategories.filter(cat => cat.parent_id != null);

  // 顶级分类 = fabric / garment
  const rootCategories = allCategories.filter(cat => cat.parent_id == null);

  return {
    categories: childCategories,
    rootCategories,
    allCategories,
    error: null,
    values: null
  };
}

export const actions = {
  default: async ({ locals, request, fetch, cookies }) => {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
      throw error(403, 'Forbidden');
    }

    const form = await request.formData();
    const payload = Object.fromEntries(form);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧾 Incoming payload:', JSON.stringify(payload, null, 2));

    // 数字字段清洗
    const cleanPayload = {
      ...payload,
      base_price: payload.base_price ? parseFloat(payload.base_price) : null,
      category_id: payload.category_id ? parseInt(payload.category_id) : null
    };

    // ---------------------------------------------------------
    //  STEP 1：获取分类（用于推断 product_type）
    // ---------------------------------------------------------
    const categoriesRes = await api.products.listCategories({ fetch, cookies });
    const allCategories = categoriesRes.categories ?? [];

    const fabricCat = allCategories.find(c => c.code === 'fabric');
    const garmentCat = allCategories.find(c => c.code === 'garment');

    const catId = cleanPayload.category_id;

    // ---------------------------------------------------------
    //  STEP 2：优先使用员工手动选择的 product_type
    // ---------------------------------------------------------
    let finalType = cleanPayload.product_type || null;

    // ---------------------------------------------------------
    //  STEP 3：如果手动没选 → 自动推断
    // ---------------------------------------------------------
    if (!finalType) {
      // 选 fabric（顶级）
      if (fabricCat && catId === fabricCat.id) {
        finalType = "fabric";
      }
      // 选 garment 下的子分类 → garment
      else if (garmentCat) {
        const children = allCategories.filter(c => c.parent_id === garmentCat.id);
        if (children.find(c => c.id === catId)) {
          finalType = "garment";
        }
      }
    }

    // 如果最后还是空 → 默认 garment
    if (!finalType) finalType = "garment";

    cleanPayload.product_type = finalType;

    console.log('🧠 Resolved product_type:', finalType);
    console.log('🧹 Final cleanPayload:', JSON.stringify(cleanPayload, null, 2));

    // ---------------------------------------------------------
    //  STEP 4：提交到后端
    // ---------------------------------------------------------
    try {
      const res = await api.products.create({ fetch, cookies }, cleanPayload);

      console.log("✅ Product created:", JSON.stringify(res, null, 2));

      if (res.error) {
        return { error: res.error ?? "Create failed", values: payload };
      }

      throw redirect(303, "/admin/products");

    } catch (err) {
      if (err.status === 303) throw err;

      console.error("💥 Create product failed:", err);

      return {
        error: err.message ?? "Create failed",
        values: payload
      };
    }
  }
};
