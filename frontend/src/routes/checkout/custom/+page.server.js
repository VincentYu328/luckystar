// src/routes/checkout/custom/+page.server.js
import { redirect } from '@sveltejs/kit';
import { SERVER_API_URL } from '$env/static/private';

export async function load({ locals, cookies }) {
    const user = locals.authUser;

    if (!user) {
        throw redirect(302, '/auth/login?redirect=/checkout/custom');
    }

    // ⭐ 从环境变量读取后端 API 地址
    const apiUrl = `${SERVER_API_URL}/api/customers/me/measurements`;

    // ⭐ 必须带上 cookies 才能 SSR 认证成功
    const res = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            cookie: cookies.get('session')
                ? `session=${cookies.get('session')}`
                : ''
        }
    });

    let data = {};
    try {
        data = await res.json();
    } catch {
        data = { measurements: null };
    }

    return {
        user,
        hasMeasurements: !!data.measurements
    };
}
