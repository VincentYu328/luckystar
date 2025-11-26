import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export function load({ locals }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff' || user.role !== 'admin') {
        throw error(403, 'Forbidden');
    }

    return {};
}

export const actions = {
    create: async ({ locals, request }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff' || user.role !== 'admin') {
            throw error(403, 'Forbidden');
        }

        const form = await request.formData();

        const payload = {
            full_name: form.get('full_name'),
            phone: form.get('phone'),
            email: form.get('email'),
            position_id: Number(form.get('position_id')),
            password: form.get('password'),
            address: form.get('address'),
            wechat: form.get('wechat'),
            whatsapp: form.get('whatsapp')
        };

        const res = await api.users.create(payload);

        if (res?.error) return { error: res.error };

        throw redirect(303, `/admin/users/${res.id}/edit`);
    }
};
