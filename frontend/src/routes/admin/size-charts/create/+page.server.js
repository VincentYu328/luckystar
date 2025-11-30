// frontend/src/routes/admin/size-charts/create/+page.server.js
import { api } from '$lib/server/api.js';
import { error, redirect, fail } from '@sveltejs/kit';

export function load({ locals }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    return {};
}

export const actions = {
    create: async ({ locals, request }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const form = await request.formData();

        // 收集 chart 基本信息
        const chartPayload = {
            name: form.get('name'),
            gender: form.get('gender'),
            notes: form.get('notes')
        };

        // 收集 items
        const items = [];
        let index = 0;
        while (form.has(`items[${index}].size_label`)) {
            const size_label = form.get(`items[${index}].size_label`);

            // 只添加有 size_label 的项
            if (size_label && size_label.trim()) {
                const item = {
                    size_label: size_label.trim(),
                    chest: form.get(`items[${index}].chest`) ? parseFloat(form.get(`items[${index}].chest`)) : null,
                    waist: form.get(`items[${index}].waist`) ? parseFloat(form.get(`items[${index}].waist`)) : null,
                    hip: form.get(`items[${index}].hip`) ? parseFloat(form.get(`items[${index}].hip`)) : null,
                    height: form.get(`items[${index}].height`) ? parseFloat(form.get(`items[${index}].height`)) : null,
                };
                items.push(item);
            }
            index++;
        }

        console.log('[CREATE SIZE CHART] Chart payload:', chartPayload);
        console.log('[CREATE SIZE CHART] Items:', items);

        // 验证至少有一个 item
        if (items.length === 0) {
            return fail(400, { error: 'Please add at least one size measurement' });
        }

        try {
            // 1. 创建 chart
            const chartRes = await api.sizeCharts.create(chartPayload);

            if (!chartRes || chartRes.error) {
                return fail(400, { error: chartRes?.error || 'Failed to create size chart' });
            }

            const chartId = chartRes.id;
            console.log('[CREATE SIZE CHART] Created chart ID:', chartId);

            // 2. 为 chart 添加 items
            for (const item of items) {
                try {
                    await api.sizeCharts.items.create(chartId, item);
                } catch (err) {
                    console.error('[CREATE SIZE CHART] Failed to create item:', err);
                    // 继续创建其他 items，不中断流程
                }
            }

            console.log('[CREATE SIZE CHART] Success! Created chart with', items.length, 'items');

            // 重定向回列表页面
            throw redirect(303, '/admin/size-charts');

        } catch (err) {
            // 如果是 redirect，直接抛出
            if (err.status === 303) throw err;

            console.error('[CREATE SIZE CHART] Error:', err);
            return fail(500, { error: err.message || 'Failed to create size chart' });
        }
    }
};
