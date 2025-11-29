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
    default: async ({ locals, request }) => {
        const user = locals.authUser;

        if (!user) throw redirect(302, '/auth/login');

        const form = await request.formData();
        const payload = Object.fromEntries(form);

        try {
            // ✅ 正确调用：使用 api.my.saveMeasurements 函数
            // 它是为当前登录用户 (/customers/me/measurements) 设计的
            await api.my.saveMeasurements(payload);
            
            // 注意：如果您的 api.js 确实需要传递 {fetch, cookies}，您应该这样写：
            // await api.my.saveMeasurements({ fetch, cookies }, payload);
            // 但根据您提供的 api.js 结构（使用 globalFetch/initApi），通常只需要传 payload。

        } catch (err) {
            console.error('Save measurement failed:', err);
            return fail(500, { error: 'Failed to save measurements' });
        }

        throw redirect(303, '/checkout/custom/measurement?saved=1');
    }
};