// frontend/src/routes/admin/size-charts/+page.server.js
import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    // 仅 STAFF 可访问
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // 拉取全部尺码表
    const result = await api.sizeCharts.list();

    // 兼容两种结构：直接数组 或 { items: [...] }
    const sizeCharts = Array.isArray(result)
        ? result
        : (result?.items ?? []);

    return { sizeCharts };
}
