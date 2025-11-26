// src/routes/checkout/custom/measurement/+page.server.js
import { redirect } from '@sveltejs/kit';
import { SERVER_API_URL } from '$env/static/private';

export async function load({ locals, fetch }) {
    // ⭐ 正确字段是 locals.user，不是 locals.authUser
    const user = locals.user;
    if (!user) {
        throw redirect(302, '/auth/login?redirect=/checkout/custom/measurement');
    }

    const url = `${SERVER_API_URL}/api/customers/me/measurements`;

    // ⭐ SvelteKit 内置 fetch 自动带 cookie，无需 headers.cookie
    const res = await fetch(url);

    let data = {};
    try {
        data = await res.json();
    } catch {
        data = {};
    }

    return {
        user,
        measurements: data.measurements || null
    };
}

export const actions = {
    save: async ({ locals, request, fetch }) => {
        const user = locals.user;
        if (!user) throw redirect(302, '/auth/login');

        const form = await request.formData();
        const payload = Object.fromEntries(form);

        const url = `${SERVER_API_URL}/api/customers/me/measurements`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            console.error('Save measurements failed:', await res.text());
            throw redirect(303, '/checkout/custom/measurement?error=save_failed');
        }

        throw redirect(303, '/my/measurements');
    }
};
