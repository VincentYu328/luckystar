import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;
    if (!user || user.role !== 'admin') throw error(403);

    const detail = await api.users.get(params.id);
    if (!detail) throw error(404);

    return { detail };
}

export const actions = {
    save: async ({ locals, params, request }) => {
        const admin = locals.authUser;
        if (!admin || admin.role !== 'admin') throw error(403);

        const form = await request.formData();

        const payload = {
            full_name: form.get('full_name'),
            phone: form.get('phone'),
            email: form.get('email'),
            address: form.get('address'),
            wechat: form.get('wechat'),
            whatsapp: form.get('whatsapp'),
            position_id: Number(form.get('position_id')),
            is_active: form.get('is_active') === '1'
        };

        const res = await api.users.update(params.id, payload);

        if (res?.error) return { error: res.error };

        throw redirect(303, `/admin/users/${params.id}/edit`);
    }
};
