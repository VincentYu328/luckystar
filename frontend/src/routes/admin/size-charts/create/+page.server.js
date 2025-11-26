// frontend/src/routes/admin/size-charts/create/+page.server.js
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

        const payload = {
            name: form.get('name'),
            gender: form.get('gender'),
            category_id: form.get('category_id') ? Number(form.get('category_id')) : null,
            notes: form.get('notes')
        };

        const res = await api.sizeCharts.create(payload);

        if (!res || res.error) {
            return { error: res?.error || 'Failed to create size chart' };
        }

        throw redirect(303, `/admin/size-charts/${res.id}/edit`);
    }
};
