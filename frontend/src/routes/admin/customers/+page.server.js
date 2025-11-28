// frontend\src\routes\admin\customers\+page.server.js

// frontend\src\routes\admin\customers\+page.server.js (修改)

import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';
import { cleanForm } from '$lib/server/form-utils.js'; // 确保导入

// frontend\src\routes\admin\customers\+page.server.js (修正 load 函数)

export const load = async ({ url, locals }) => {
    // ... (权限校验不变)

    const keyword = url.searchParams.get('keyword')?.trim() || '';
    console.log("[LOAD /admin/customers] current keyword for API:", keyword);

    // 构建查询参数对象
    const queryParams = {};
    if (keyword) {
        queryParams.keyword = keyword;
    }

    let customers = [];
    try {
        // 调用后端 API，并传递查询参数
        const result = await api.customers.list(queryParams); 
        
        // --- 核心修正 START ---
        // 确保 result 就是列表本身，或者从 result.customers/result.data 中提取列表
        if (Array.isArray(result)) {
            // 如果 API 直接返回数组，则直接使用
            customers = result;
        } else if (result && (Array.isArray(result.customers) || Array.isArray(result.data))) {
            // 否则，从最可能的属性中提取数组
            customers = result.customers || result.data || [];
        } else {
            // 如果返回的数据既不是数组也不是包含数组的对象，则默认为空
            customers = [];
            console.error("[LOAD /admin/customers] API returned non-list structure:", result);
        }
        // --- 核心修正 END ---
        
        // 打印最终返回给前端的客户数量
        console.log("[LOAD /admin/customers] fetched customers count from API:", customers.length);

    } catch (e) {
        console.error("Error fetching customers from API:", e);
        // 可以选择抛出错误，或返回空列表
        customers = []; 
    }


    // ... (其余代码不变，包括 return 语句)

    // 统一重定向参数名
    const deleteSuccess = url.searchParams.get('deleteSuccess') === 'true';
    const deleteError = url.searchParams.get('deleteError') || null;
    const createSuccess = url.searchParams.get('createSuccess') === 'true';
    const createError = url.searchParams.get('createError') || null;

    return {
        customers, // 🚀 确保这里是经过正确提取的数组
        keyword, 
        deleteSuccess,
        deleteError,
        createSuccess,
        createError
    };
};

// ... actions 保持不变 ...
// ... actions 保持不变 ...
export const actions = {
    delete: async ({ request, url, locals }) => { // 模式A: actions 函数签名无需 fetch, cookies
        // 权限校验
        if (!locals.authUser || locals.authUser.type !== 'staff') {
            throw redirect(302, '/auth/login?redirect=/admin/customers');
        }

        const formData = await request.formData();
        const rawPayload = Object.fromEntries(formData);
        console.log("[ACTION /admin/customers?/delete] rawPayload:", rawPayload); // 规则 13

        // 规则 12: FormData 必须做“空字串清洗”并转换为数字
        const payload = cleanForm(rawPayload);
        console.log("[ACTION /admin/customers?/delete] cleaned payload:", payload); // 规则 13

        const customerId = payload.customer_id; // 从清洗后的 payload 获取 customer_id

        if (!customerId) {
            throw redirect(303, `/admin/customers?deleteError=${encodeURIComponent('Missing customer id')}`);
        }

        try {
            // 直接调用 api.customers.delete，因为它已经符合模式A
            const res = await api.customers.delete(customerId);
            console.log("[ACTION /admin/customers?/delete] API response:", res); // 规则 13

            if (res.success) {
                // 成功：重定向带 deleteSuccess 标记
                throw redirect(303, '/admin/customers?deleteSuccess=true');
            } else {
                // 失败：重定向带 deleteError 标记
                throw redirect(303, `/admin/customers?deleteError=${encodeURIComponent(res.error || 'Delete failed')}`);
            }
        } catch (err) {
            console.error("[ACTION /admin/customers?/delete] Error deleting customer:", err); // 规则 13
            throw redirect(303, `/admin/customers?deleteError=${encodeURIComponent(err.message || 'Delete failed due to API error')}`);
        }
    }
};