// frontend/src/routes/admin/customers/create/+page.server.js
import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export function load({ locals }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    return {};
}

export const actions = {
    create: async ({ locals, request }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const form = await request.formData();

        const password = form.get('password');
        const confirm_password = form.get('confirm_password');

        // 前端 → 后端 前的安全守门
        if (!password || !confirm_password || password !== confirm_password) {
            return { error: 'Passwords do not match' };
        }

        const payload = {
            full_name: form.get('full_name'),
            phone: form.get('phone'),
            email: form.get('email'),
            address: form.get('address'),
            wechat: form.get('wechat'),
            whatsapp: form.get('whatsapp'),
            password
        };

        const res = await api.customers.create(payload);

        if (!res || res.error) {
            return { error: res?.error || 'Failed to create customer' };
        }

        throw redirect(303, `/admin/customers/${res.id}`);
    }
};
