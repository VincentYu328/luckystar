// src/routes/checkout/custom/measurement/+page.server.js
import { redirect, fail } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export async function load({ locals, fetch, cookies, url }) {
    const user = locals.authUser;

    if (!user || user.type !== 'customer') {
        throw redirect(302, '/auth/login?redirect=/checkout/custom/measurement');
    }

    let measurements;
    try {
        const res = await api.my.measurements({ fetch, cookies });
        measurements = res.measurements || null;
    } catch {
        measurements = null;
    }

    return {
        user,
        measurements,
        successMessage: url.searchParams.get('saved') ? 'Your measurements have been saved.' : null
    };
}

export const actions = {
    default: async ({ locals, request, fetch, cookies }) => {
        const user = locals.authUser;

        if (!user) throw redirect(302, '/auth/login');

        const form = await request.formData();
        const payload = Object.fromEntries(form);

        try {
            // ⭐ 使用 API 封装，不手写 fetch
            await api.measurements.create(
                { fetch, cookies },
                payload
            );
        } catch (err) {
            console.error('Save measurement failed:', err);
            return fail(500, { error: 'Failed to save measurements' });
        }

        throw redirect(303, '/checkout/custom/measurement?saved=1');
    }
};
