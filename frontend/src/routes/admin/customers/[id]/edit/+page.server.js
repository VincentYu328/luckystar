// frontend/src/routes/admin/customers/[id]/edit/+page.server.js
import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const id = params.id;

    const customer = await api.customers.get(id);

    if (!customer || customer.error) {
        throw error(404, 'Customer not found');
    }

    return { customer };
}

export const actions = {
    save: async ({ locals, params, request }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const id = params.id;
        const form = await request.formData();

        const payload = {
            full_name: form.get('full_name'),
            phone: form.get('phone'),
            email: form.get('email'),
            address: form.get('address'),
            wechat: form.get('wechat'),
            whatsapp: form.get('whatsapp'),
            is_active: form.get('is_active') === '1'
        };

        await api.customers.update(id, payload);

        throw redirect(303, `/admin/customers/${id}`);
    }
};
