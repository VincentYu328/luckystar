// src/routes/checkout/custom/measurement/+page.server.js
import { redirect } from '@sveltejs/kit';
import { SERVER_API_URL } from '$env/static/private';

function buildCookieHeader(cookies) {
    const pairs = cookies.getAll().map(({ name, value }) => `${name}=${value}`);
    return pairs.length ? pairs.join('; ') : '';
}

export async function load({ locals, fetch, cookies, url: requestUrl }) {
    const user = locals.authUser;

    if (!user || user.type !== 'customer') {
        throw redirect(302, '/auth/login?redirect=/checkout/custom/measurement');
    }

    const apiUrl = `${SERVER_API_URL}/api/customers/me/measurements`;
    const cookieHeader = buildCookieHeader(cookies);

    const res = await fetch(apiUrl, {
        headers: cookieHeader ? { cookie: cookieHeader } : {}
    });

    let data = {};
    try {
        data = await res.json();
    } catch {
        data = {};
    }

    const successMessage = requestUrl.searchParams.get('saved') === '1'
        ? 'Your measurements have been saved.'
        : null;

    return {
        user,
        measurements: data.measurements || null,
        successMessage
    };
}

export const actions = {
    default: async ({ locals, request, fetch, cookies }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'customer') {
            throw redirect(302, '/auth/login');
        }

        const form = await request.formData();
        const payload = Object.fromEntries(form);

        const apiUrl = `${SERVER_API_URL}/api/customers/me/measurements`;
        const cookieHeader = buildCookieHeader(cookies);

        const res = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(cookieHeader ? { cookie: cookieHeader } : {})
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            console.error('Save measurements failed:', await res.text());
            throw redirect(303, '/checkout/custom/measurement?error=save_failed');
        }

        throw redirect(303, '/checkout/custom/measurement?saved=1');
    }
};
