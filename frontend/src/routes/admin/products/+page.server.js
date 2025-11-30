import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';
import { cleanForm } from '$lib/server/form-utils.js';

export async function load({ locals, url }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw redirect(302, '/auth/login?redirect=/admin/products');
    }

    // 移除不稳定的权限检查：不再在前端LOAD中显式检查 'products.view'
    // 而是依赖后端路由的 requirePermission 中间件。

    let products = [];
    let loadError = null;

    try {
        // 尝试获取产品列表。如果用户没有权限，后端会返回403，并由 API 库抛出错误。
        const res = await api.products.list();
        console.log("[LOAD /admin/products] fetched products:", res.products ? res.products.length : 0);
        products = res.products ?? [];
    } catch (err) {
        // 捕获 API 调用失败（包括后端返回 403 Forbidden）
        console.error("[LOAD /admin/products] API Error:", err.message);
        loadError = err.message;
    }


    // 从 URL 中获取删除操作的结果
    const deleteSuccess = url.searchParams.get('deleteSuccess') === 'true';
    const deleteError = url.searchParams.get('deleteError') || null;

    return {
        products: products,
        deleteError: deleteError,
        deleteSuccess: deleteSuccess,
        loadError: loadError
    };
}

export const actions = {
    delete: async ({ locals, request }) => { // 模式A: actions 函数签名无需 fetch, cookies
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw redirect(302, '/auth/login?redirect=/admin/products');
        }

        // ⭐ 修正：保留 actions 中的权限检查，但使用最稳定的 Set 转换方法
        const userPermissions = new Set(Array.from(user.permissions || []));
        if (!userPermissions.has('products.delete')) {
            throw redirect(303, `/admin/products?deleteError=${encodeURIComponent('Permission denied to delete product.')}`);
        }

        const formData = await request.formData();
        const rawPayload = Object.fromEntries(formData);
        console.log("[ACTION /admin/products?/delete] rawPayload:", rawPayload);

        // 规则 12: FormData 必须做“空字串清洗”并转换为数字
        const payload = cleanForm(rawPayload);
        console.log("[ACTION /admin/products?/delete] cleaned payload:", payload);

        const productId = payload.product_id; // 从清洗后的 payload 获取 product_id

        if (!productId) { // 此时 productId 已经是 Number 或 null
            // 规则 14: 即使是客户端错误也重定向，并带上错误信息
            throw redirect(303, `/admin/products?deleteError=${encodeURIComponent('Missing product id')}`);
        }

        try {
            // 规则 11: 模式 A，API 调用无需传递 { fetch, cookies }
            // 确保 api.products.delete 内部是直接使用 id 的，且它自身内部会构建正确的 URL
            const res = await api.products.delete(productId);
            console.log("[ACTION /admin/products?/delete] API response:", res);

            if (res.success) { // 检查后端返回的成功标志
                // 规则 14: POST 成功后必须 redirect(303, …)
                throw redirect(303, '/admin/products?deleteSuccess=true');
            } else {
                // 如果后端返回的 res.success 为 false，或者有错误信息
                throw redirect(303, `/admin/products?deleteError=${encodeURIComponent(res.error || 'Delete failed')}`);
            }
        } catch (err) {
            console.error("[ACTION /admin/products?/delete] Error deleting product:", err);
            // 捕获 API 调用过程中抛出的错误（例如网络错误、HTTP 状态码非 2xx 等）
            throw redirect(303, `/admin/products?deleteError=${encodeURIComponent(err.message || 'Delete failed due to API error')}`);
        }
    }
};