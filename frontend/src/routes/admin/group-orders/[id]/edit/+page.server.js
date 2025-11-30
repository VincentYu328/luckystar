import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params, fetch, cookies }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const id = Number(params.id);

    try {
        const order = await api.groupOrders.get(id, { fetch, cookies });

        if (!order) {
            throw error(404, 'Group order not found');
        }

        return {
            order: order
        };
    } catch (err) {
        console.error('[group-orders/[id]/edit] Error loading:', err);
        throw error(404, 'Group order not found');
    }
}

export const actions = {
    default: async ({ locals, request, params, fetch, cookies }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const id = Number(params.id);
        const form = await request.formData();

        const payload = {
            group_name: form.get('group_name'),
            event_name: form.get('event_name') || null,
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

            // Redirect back to detail page
            throw redirect(303, `/admin/group-orders/${id}`);
        } catch (err) {
            if (err.status === 303) throw err;
            console.error('[group-orders/[id]/edit] Error updating:', err);
            return {
                error: err.message || 'Failed to update group order.'
            };
        }
    }
};
