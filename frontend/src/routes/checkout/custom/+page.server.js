// src/routes/checkout/custom/+page.server.js
import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export async function load({ locals, fetch, cookies }) {
    const user = locals.authUser;

    if (!user || user.type !== 'customer') {
        throw redirect(302, '/auth/login?redirect=/checkout/custom');
    }

    // ⭐ 使用封装好的 API，不拼 URL，不拼 Cookie
    let measurements;
    try {
        const res = await api.my.measurements({ fetch, cookies });
        measurements = res.measurements || null;
    } catch {
        measurements = null;
    }

    return {
        user,
        hasMeasurements: !!measurements
    };
}