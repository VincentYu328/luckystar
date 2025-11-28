// src/routes/admin/products/[id]/edit/+page.server.js
import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // ⭐ 必须确保是数字
    const id = Number(params.id);

    console.log("🔍 Load product id =", id);

    // ⭐ 完全正确的调用方式（模式 A）
    const res = await api.products.get(id);

    // 响应可能是 { product: {...} } 或直接 {...}
    const product = res.product ?? res;

    if (!product) {
        throw error(404, "Product not found");
    }

    // 读取分类
    const catRes = await api.products.listCategories();
    const categories = catRes.categories ?? [];

    return {
        product,
        categories,
        error: null,
        success: false,
        values: null
    };
}


export const actions = {
    default: async ({ params, request, locals }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const id = Number(params.id);

        const form = await request.formData();
        const payload = Object.fromEntries(form);

        console.log("📝 Incoming payload:", payload);

        const clean = {
            ...payload,
            base_price: payload.base_price ? parseFloat(payload.base_price) : null,
            category_id: payload.category_id ? parseInt(payload.category_id) : null
        };

        const allCatsRes = await api.products.listCategories();
        const allCats = allCatsRes.categories ?? [];

        const fabricCat = allCats.find(c => c.code === 'fabric');
        const garmentCat = allCats.find(c => c.code === 'garment');

        let finalType = clean.product_type;
        const catId = clean.category_id;

        if (!finalType) {
            if (fabricCat && catId === fabricCat.id) {
                finalType = "fabric";
            } else if (garmentCat) {
                const children = allCats.filter(c => c.parent_id === garmentCat.id);
                if (children.find(c => c.id === catId)) {
                    finalType = "garment";
                }
            }
        }

        if (!finalType) finalType = "garment";
        clean.product_type = finalType;

        console.log("➡ Final payload to backend:", clean);

        // ⭐ 完全正确的调用方式
        try {
            const res = await api.products.update(id, clean);

            if (res?.error) {
                return { success: false, error: res.error, values: payload };
            }

            return { success: true, error: null, values: clean };
        } catch (err) {
            return { success: false, error: err.message, values: payload };
        }
    }
};
