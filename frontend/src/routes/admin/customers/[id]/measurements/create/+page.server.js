// frontend/src/routes/admin/measurements/create/+page.server.js
import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export function load({ locals, url }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const customer_id = url.searchParams.get('customer_id');

    if (!customer_id) {
        throw error(400, 'customer_id is required');
    }

    return {
        customer_id
    };
}

export const actions = {
    create: async ({ locals, request }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const form = await request.formData();

        const payload = {
            customer_id: form.get('customer_id'),
            gender: form.get('gender'),
            height: form.get('height'),
            weight: form.get('weight'),
            chest: form.get('chest'),
            waist: form.get('waist'),
            hips: form.get('hips'),
            shoulder: form.get('shoulder'),
            sleeve: form.get('sleeve'),
            inseam: form.get('inseam'),
            outseam: form.get('outseam'),
            thigh: form.get('thigh'),
            calf: form.get('calf'),
            neckline: form.get('neckline'),
            notes: form.get('notes')
        };

        const res = await api.measurements.create(payload);

        if (!res || res.error) {
            return { error: res?.error || 'Failed to create measurement' };
        }

        throw redirect(303, `/admin/measurements/${res.id}`);
    }
};
