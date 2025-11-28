// src/routes/admin/products/create/+page.server.js
import { api } from '$lib/server/api.js';
import { redirect, error } from '@sveltejs/kit';

/**
 * 规则 12：通用表单数据清洗函数
 * 将空字符串转换为 null，将数字字符串转换为数字
 */
function cleanForm(data) {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    // 处理空值和 undefined
    if (v === '' || v === undefined || v === null) {
      out[k] = null;
    }
    // 处理数字 (注意：!isNaN("") 会返回 true，所以必须先排除空字符串)
    // Number(v) 可以同时处理整数和浮点数
    else if (!isNaN(v) && typeof v === 'string' && v.trim() !== '') {
      out[k] = Number(v);
    }
    // 其他情况保持原样
    else {
      out[k] = v;
    }
  }
  return out;
}

export async function load({ locals }) {
  const user = locals.authUser;
  if (!user || user.type !== 'staff') {
    throw error(403, 'Forbidden');
  }

  // 规则 11：Mode A，无需传递 { fetch, cookies }
  const categoriesRes = await api.products.listCategories();
  // 规则 4：类型防御
  const allCategories = Array.isArray(categoriesRes.categories) ? categoriesRes.categories : [];

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
  default: async ({ locals, request }) => {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
      throw error(403, 'Forbidden');
    }

    const formData = await request.formData();
    const rawPayload = Object.fromEntries(formData);

    // 规则 13：Debug 打印原始数据
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧾 [Create Product] Raw Payload:', JSON.stringify(rawPayload, null, 2));

    // 规则 12：执行通用清洗（关键修复：处理空字符串和数字类型）
    const cleanPayload = cleanForm(rawPayload);

    // ---------------------------------------------------------
    //  STEP 1：获取分类（用于推断 product_type）
    // ---------------------------------------------------------
    // 规则 11：Mode A，无需传参
    const categoriesRes = await api.products.listCategories();
    // 规则 4：类型防御
    const allCategories = Array.isArray(categoriesRes.categories) ? categoriesRes.categories : [];

    const fabricCat = allCategories.find(c => c.code === 'fabric');
    const garmentCat = allCategories.find(c => c.code === 'garment');

    // cleanPayload.category_id 现在是数字或 null，可以安全比较
    const catId = cleanPayload.category_id;

    // ---------------------------------------------------------
    //  STEP 2：优先使用员工手动选择的 product_type
    // ---------------------------------------------------------
    let finalType = cleanPayload.product_type || null;

    // ---------------------------------------------------------
    //  STEP 3：如果手动没选 → 自动推断
    // ---------------------------------------------------------
    if (!finalType && catId !== null) {
      // 选 fabric（顶级）
      if (fabricCat && catId === fabricCat.id) {
        finalType = "fabric";
      }
      // 选 garment 下的子分类 → garment
      else if (garmentCat) {
        // 规则 5：确认是数组
        const children = allCategories.filter(c => c.parent_id === garmentCat.id);
        if (children.find(c => c.id === catId)) {
          finalType = "garment";
        }
      }
    }

    // 如果最后还是空 → 默认 garment
    if (!finalType) finalType = "garment";

    cleanPayload.product_type = finalType;

    // 规则 13：Debug 打印最终清洗后的数据
    console.log('🧠 [Create Product] Resolved product_type:', finalType);
    console.log('🧹 [Create Product] Final Clean Payload (Sending to API):', JSON.stringify(cleanPayload, null, 2));

    // ---------------------------------------------------------
    //  STEP 4：提交到后端
    // ---------------------------------------------------------
    try {
      // 规则 11：Mode A，只需传递 data，无需 { fetch, cookies }
      const res = await api.products.create(cleanPayload);

      console.log("✅ [Create Product] Success Response:", JSON.stringify(res, null, 2));

      if (res.error) {
        // 返回原始 payload 以便用户修改，而不是清洗后的
        return { error: res.error, values: rawPayload };
      }

      // 规则 14：成功后必须 303 跳转
      throw redirect(303, "/admin/products");

    } catch (err) {
      // 捕获 redirect 抛出的异常
      if (err.status === 303) throw err;

      console.error("💥 [Create Product] Failed:", err);

      return {
        error: err.message ?? "Create failed. Check server logs.",
        values: rawPayload // 返回原始数据回显
      };
    }
  }
};