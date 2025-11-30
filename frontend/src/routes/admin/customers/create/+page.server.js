import { api } from '$lib/server/api.js';
import { error, fail } from '@sveltejs/kit';
// 假设您不需要在此处重定向，因为编辑页面通常停留在当前页面显示更新后的数据。

/**
 * @description Load function for create customer page
 */
export async function load({ locals }) {
  const user = locals.authUser;
  if (!user || user.type !== 'staff') {
    throw error(403, 'Forbidden');
  }

  return {
    error: null,
    success: false,
    values: null
  };
}

// -----------------------------------------------------------
// Actions 逻辑：处理表单提交
// -----------------------------------------------------------
import { redirect, fail } from '@sveltejs/kit'; 

export const actions = {
    default: async ({ request, locals, fetch, cookies }) => {
        const user = locals.authUser;
        
        // --- LOG 1: 动作开始和权限检查 ---
        console.log("--- [Create Customer Action START] ---");

        if (!user || user.type !== 'staff') {
            console.error("[LOG 1] Permission Denied: Not a staff user.");
            throw error(403, 'Forbidden');
        }

        const form = await request.formData();
        const payload = Object.fromEntries(form);

        // --- LOG 2: 原始表单数据 ---
        console.log("[LOG 2] Raw Payload Received:", payload);

        // --- 1. 验证和清理 ---

        const requiredFields = ['full_name', 'phone', 'email', 'password', 'confirm_password'];
        for (const field of requiredFields) {
            if (!payload[field] || String(payload[field]).trim() === '') {
                console.warn(`[LOG 3] Validation Failed: Missing required field: ${field}`);
                return fail(400, { error: `${field} is required`, values: payload });
            }
        }
        
        if (payload.password !== payload.confirm_password) {
            console.warn("[LOG 4] Validation Failed: Passwords do not match.");
            return fail(400, {
                error: 'Password and Confirm Password do not match.',
                values: payload
            });
        }

        // --- 4. 构建 Payload ---
        // Note: 后端会自己处理密码哈希，所以这里直接发送 password 字段
        const cleanPayload = {
            full_name: String(payload.full_name).trim(),
            phone: String(payload.phone).trim(),
            email: String(payload.email).trim(),
            password: String(payload.password),
            is_active: 1,

            // 可选字段处理
            address: payload.address ? String(payload.address).trim() : null,
            wechat: payload.wechat ? String(payload.wechat).trim() : null,
            whatsapp: payload.whatsapp ? String(payload.whatsapp).trim() : null,
        };

        // --- LOG 5: 干净的最终 Payload ---
        console.log("[LOG 5] Clean Payload to API:", cleanPayload);


        // --- 6. 调用 API ---
        try {
            console.log("[LOG 6] Calling API: api.customers.create...");
            const res = await api.customers.create(cleanPayload, { fetch, cookies });
            console.log("[LOG 7] API Response Received:", res);

            if (res.error) {
                console.warn(`[LOG 8] API returned error: ${res.error}`);
                return fail(400, { error: res.error, values: payload });
            }

            // --- LOG 9: 成功和重定向 ---
            console.log("[LOG 9] Customer created successfully. Redirecting.");
            throw redirect(303, '/admin/customers');

        } catch (err) {
            // 捕获 API 调用或重定向错误
            if (err.status === 303) {
                console.log("[LOG 10] Caught redirect (Success).");
                throw err;
            }

            // --- LOG 11: 致命的 API 或网络错误 ---
            console.error(`[LOG 11] CRITICAL API/NETWORK ERROR: ${err.message}`, err);
            return fail(500, {
                error: err.message || 'Failed to create customer due to API error.',
                values: payload
            });
        } finally {
            console.log("--- [Create Customer Action END] ---");
        }
    }
};