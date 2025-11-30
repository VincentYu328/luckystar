// frontend/src/routes/admin/size-charts/[id]/edit/+page.server.js

import { api } from '$lib/server/api.js';
import { error, redirect, fail } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') throw error(403, 'Forbidden');

    // 获取 chart 和 items
    const [chartRes, itemsRes] = await Promise.all([
        api.sizeCharts.get(params.id),
        api.sizeCharts.items.list(params.id)
    ]);

    if (!chartRes || chartRes.error) throw error(404, 'Size chart not found');

    const chart = chartRes;
    const items = itemsRes?.items ?? itemsRes ?? [];

    console.log('[EDIT SIZE CHART] Loaded chart:', chart);
    console.log('[EDIT SIZE CHART] Loaded items:', items);

    return { chart, items };
}

export const actions = {
    update: async ({ locals, params, request }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') throw error(403, 'Forbidden');

        const form = await request.formData();

        // 收集 chart 基本信息
        const chartPayload = {
            name: form.get('name')?.trim(),
            gender: form.get('gender') || null,
            notes: form.get('notes')?.trim() || null
        };

        // 收集 items
        const items = [];
        let index = 0;
        while (form.has(`items[${index}].size_label`)) {
            const size_label = form.get(`items[${index}].size_label`);
            const itemId = form.get(`items[${index}].id`);

            if (size_label && size_label.trim()) {
                const item = {
                    id: itemId ? Number(itemId) : null,
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

        console.log('[UPDATE SIZE CHART] Chart payload:', chartPayload);
        console.log('[UPDATE SIZE CHART] Items:', items);

        if (items.length === 0) {
            return fail(400, { error: 'Please add at least one size measurement' });
        }

        try {
            // 1. 更新 chart
            const chartRes = await api.sizeCharts.update(params.id, chartPayload);
            if (chartRes?.error) {
                return fail(400, { error: chartRes.error });
            }

            // 2. 获取现有的 items
            const existingItemsRes = await api.sizeCharts.items.list(params.id);
            const existingItems = existingItemsRes?.items ?? existingItemsRes ?? [];
            const existingIds = new Set(existingItems.map(item => item.id));

            // 3. 更新或创建 items
            for (const item of items) {
                try {
                    if (item.id && existingIds.has(item.id)) {
                        // 更新现有 item
                        await api.sizeCharts.items.update(item.id, {
                            size_label: item.size_label,
                            chest: item.chest,
                            waist: item.waist,
                            hip: item.hip,
                            height: item.height,
                        });
                        existingIds.delete(item.id); // 标记为已处理
                    } else {
                        // 创建新 item
                        await api.sizeCharts.items.create(params.id, item);
                    }
                } catch (err) {
                    console.error('[UPDATE SIZE CHART] Failed to update/create item:', err);
                }
            }

            // 4. 删除不再存在的 items
            for (const idToDelete of existingIds) {
                try {
                    await api.sizeCharts.items.delete(idToDelete);
                } catch (err) {
                    console.error('[UPDATE SIZE CHART] Failed to delete item:', err);
                }
            }

            console.log('[UPDATE SIZE CHART] Success!');

            // 重定向回列表页面
            throw redirect(303, '/admin/size-charts');

        } catch (err) {
            if (err.status === 303) throw err;
            console.error('[UPDATE SIZE CHART] Error:', err);
            return fail(500, { error: err.message || 'Failed to update size chart' });
        }
    },

    delete: async ({ locals, params }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') throw error(403, 'Forbidden');

        try {
            await api.sizeCharts.delete(params.id);
            throw redirect(303, '/admin/size-charts');
        } catch (err) {
            if (err.status === 303) throw err;
            console.error('[DELETE SIZE CHART] Error:', err);
            return fail(500, { error: err.message || 'Failed to delete size chart' });
        }
    }
};
