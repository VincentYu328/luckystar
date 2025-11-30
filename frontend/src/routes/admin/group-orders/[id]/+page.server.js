import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params, fetch, cookies }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const id = Number(params.id);

    try {
        // 获取团体订单信息和成员列表
        const [order, membersRes] = await Promise.all([
            api.groupOrders.get(id, { fetch, cookies }),
            api.groupOrders.members(id, { fetch, cookies })
        ]);

        if (!order) {
            throw error(404, 'Group order not found');
        }

        return {
            order: order,
            members: membersRes.members ?? []
        };
    } catch (err) {
        console.error('[group-orders/[id]] Error loading:', err);
        throw error(404, 'Group order not found');
    }
}

export const actions = {
    update: async ({ locals, request, params, fetch, cookies }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const id = Number(params.id);
        const form = await request.formData();

        const payload = {
            group_name: form.get('group_name'),
            event_name: form.get('event_name'),
            expected_members: form.get('expected_members') ? Number(form.get('expected_members')) : null,
            fabric_selected: form.get('fabric_selected') || null,
            event_start: form.get('event_start') || null,
            event_end: form.get('event_end') || null,
            notes: form.get('notes') || null
        };

        try {
            const res = await api.groupOrders.update(id, payload, { fetch, cookies });

            if (!res.success) {
                return {
                    error: res.error || 'Failed to update group order.'
                };
            }

            // 刷新详情页
            throw redirect(303, `/admin/group-orders/${id}`);
        } catch (err) {
            if (err.status === 303) throw err;
            return {
                error: err.message || 'Failed to update group order.'
            };
        }
    }
};
