// frontend/src/routes/admin/size-charts/[id]/edit/+page.server.js

import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') throw error(403, 'Forbidden');

    const chart = await api.sizeCharts.get(params.id);

    if (!chart || chart.error) throw error(404, 'Size chart not found');

    return { chart };
}

export const actions = {
    save: async ({ locals, params, request }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') throw error(403, 'Forbidden');

        const form = await request.formData();

        const payload = {
            name: form.get('name')?.trim(),
            gender: form.get('gender') || null,
            category_id: form.get('category_id') ? Number(form.get('category_id')) : null,
            notes: form.get('notes')?.trim() || null
        };

        const res = await api.sizeCharts.update(params.id, payload);

        if (res?.error) {
            return { error: res.error };
        }

        throw redirect(303, `/admin/size-charts/${params.id}/items`);
    }
};
