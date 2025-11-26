// frontend/src/routes/admin/size-charts/[id]/items/+page.server.js
import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') throw error(403);

    // 获取尺码表
    const chart = await api.sizeCharts.get(params.id);
    if (!chart) throw error(404, 'Size chart not found');

    // 获取该尺码表下的尺码项
    const result = await api.sizeChartItems.list(params.id);
    const items = result?.items ?? [];

    return {
        chart,
        items
    };
}
