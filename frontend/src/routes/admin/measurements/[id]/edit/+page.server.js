
// frontend\src\routes\admin\measurements\[id]\edit\+page.server.js

import { api } from '$lib/server/api.js';
import { redirect, error } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const id = Number(params.id);
    const measurement = await api.measurements.get(id);

    return { measurement };
}

export const actions = {
    default: async ({ request, params }) => {
        const id = Number(params.id);
        const form = await request.formData();
        const payload = Object.fromEntries(form);

        await api.measurements.update(id, payload);

        throw redirect(303, `/admin/measurements/${id}`);
    }
};
