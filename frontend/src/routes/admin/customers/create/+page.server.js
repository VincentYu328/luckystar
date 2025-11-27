// frontend/src/routes/admin/customers/create/+page.server.js
import { api } from '$lib/server/api.js';
import { redirect, error } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    return {
        error: null,
        values: {}
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

        const password = payload.password;
        const confirm = payload.confirm_password;

        // 前端防御 + 后端二次验证
        if (!password || !confirm || password !== confirm) {
            return {
                error: 'Passwords do not match',
                values: payload
            };
        }

        // 清洗 payload（去掉 confirm_password）
        const cleanPayload = {
            full_name: payload.full_name,
            phone: payload.phone,
            email: payload.email,
            address: payload.address || '',
            wechat: payload.wechat || '',
            whatsapp: payload.whatsapp || '',
            password: payload.password
        };

        try {
            const res = await api.customers.create(
                { fetch, cookies },
                cleanPayload
            );

            if (!res || res.error) {
                return {
                    error: res?.error || 'Failed to create customer',
                    values: payload
                };
            }

            // 后端可能返回 customer:{id:xx}
            const id = res.id ?? res.customer?.id;

            throw redirect(303, `/admin/customers/${id}`);

        } catch (err) {
            return {
                error: err.message || 'Failed to create customer',
                values: payload
            };
        }
    }
};
