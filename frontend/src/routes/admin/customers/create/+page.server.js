// frontend/src/routes/admin/customers/create/+page.server.js (再次修改)

import { api } from '$lib/server/api.js';
import { redirect, error, fail } from '@sveltejs/kit';
import { cleanForm } from '$lib/server/form-utils.js';

export async function load({ locals }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }
    return {};
}

export const actions = {
    default: async ({ locals, request }) => {
        console.log("[ACTION /admin/customers/create] Action started."); // 新增日志
        const user = locals.authUser;

        if (!user || user.type !== 'staff') {
            console.warn("[ACTION /admin/customers/create] Unauthorized access attempt."); // 新增日志
            throw error(403, 'Forbidden');
        }

        const formData = await request.formData();
        const rawPayload = Object.fromEntries(formData);
        console.log("[ACTION /admin/customers/create] rawPayload:", rawPayload);

        const payload = cleanForm(rawPayload);
        console.log("[ACTION /admin/customers/create] cleaned payload:", payload);
        console.log("[ACTION /admin/customers/create] password being sent (after cleanForm):", payload.password);

        const password = payload.password;
        const confirmPassword = payload.confirm_password;
        
        // 删除确认密码字段
        delete payload.confirm_password; 
        
        console.log("[ACTION /admin/customers/create] payload to be sent to API (after deleting confirm_password):", payload); // 新增日志

        // --- 密码验证 ---
        if (!password || !confirmPassword || password !== confirmPassword) {
            console.error("[ACTION /admin/customers/create] Password mismatch or empty."); // 新增日志
            return fail(400, {
                error: 'Passwords do not match or are empty',
                values: rawPayload // 返回原始 payload 确保所有字段都回显
            });
        }
        
        // --- 必填字段验证 ---
        if (!payload.full_name || !payload.phone || !payload.email) {
            console.error("[ACTION /admin/customers/create] Missing required fields (full_name, phone, email)."); // 新增日志
            return fail(400, {
                error: 'Full name, phone, and email are required.',
                values: rawPayload
            });
        }

        try {
            console.log("[ACTION /admin/customers/create] Attempting to call API: api.customers.create(payload)..."); // 新增日志
            const res = await api.customers.create(payload);
            console.log("[ACTION /admin/customers/create] API response received:", res); // 关键日志

            // 检查 res 是否存在且是否有错误，或后端是否明确报告失败
            if (!res || res.error || !res.success) { // 更严格的失败检查
                console.error("[ACTION /admin/customers/create] API reported failure:", res?.error || 'Unknown API error'); // 新增日志
                return fail(400, {
                    error: res?.error || 'Failed to create customer.',
                    values: rawPayload
                });
            }

            console.log("[ACTION /admin/customers/create] Customer created successfully, redirecting."); // 新增日志
            throw redirect(303, '/admin/customers?createSuccess=true');

        } catch (err) {
            console.error("[ACTION /admin/customers/create] Caught unexpected error during API call or processing:", err); // 关键日志
            return fail(500, {
                error: err.message || 'An unexpected error occurred during customer creation.',
                values: rawPayload
            });
        }
    }
};