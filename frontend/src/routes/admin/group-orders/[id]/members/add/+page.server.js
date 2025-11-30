import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params, fetch, cookies }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const groupId = Number(params.id);

    try {
        const [order, customersRes] = await Promise.all([
            api.groupOrders.get(groupId, { fetch, cookies }),
            api.customers.list({}, { fetch, cookies })
        ]);

        if (!order) {
            throw error(404, 'Group order not found');
        }

        return {
            order: order,
            customers: customersRes.customers ?? []
        };
    } catch (err) {
        console.error('[members/add] Error loading:', err);
        throw error(404, 'Group order not found');
    }
}

export const actions = {
    default: async ({ request, params, locals, fetch, cookies }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const groupId = Number(params.id);
        const form = await request.formData();

        const addType = form.get('add_type');
        const customerId = form.get('customer_id') ? Number(form.get('customer_id')) : null;

        let payload = {
            customer_id: null,
            full_name: '',
            phone: '',
            email: null,
            note: form.get('note') || null
        };

        if (addType === 'existing' && customerId) {
            try {
                const customerRes = await api.customers.get(customerId, { fetch, cookies });
                const customer = customerRes.customer;

                if (!customer) {
                    return { error: 'Customer not found.' };
                }

                payload.customer_id = customerId;
                payload.full_name = customer.full_name || '';
                payload.phone = customer.phone || '';
                payload.email = customer.email || null;

                if (!payload.full_name || !payload.phone) {
                    return { error: 'Customer data is incomplete. Full name and phone are required.' };
                }
            } catch (err) {
                console.error('[members/add] Error loading customer:', err);
                return { error: `Failed to load customer information: ${err.message}` };
            }
        } else if (addType === 'manual') {
            payload.full_name = form.get('full_name')?.trim();
            payload.phone = form.get('phone')?.trim() || '';
            payload.email = form.get('email')?.trim() || null;

            if (!payload.full_name) {
                return { error: 'Full name is required.' };
            }
            if (!payload.phone) {
                return { error: 'Phone is required.' };
            }
        } else {
            return { error: 'Please select an add type.' };
        }

        try {
            console.log('[members/add] Sending payload to API:', JSON.stringify(payload));
            const res = await api.groupOrders.addMember(groupId, payload, { fetch, cookies });
            console.log('[members/add] API response:', JSON.stringify(res));

            if (!res?.success && !res?.lastInsertRowid) {
                console.error('[members/add] API returned error:', res);
                return { error: res?.error ?? 'Failed to add member.' };
            }

            console.log('[members/add] Success! Redirecting to group order:', groupId);
            throw redirect(303, `/admin/group-orders/${groupId}`);
        } catch (err) {
            if (err.status === 303) throw err;
            console.error('[members/add] Caught error:', err.message, err);
            return { error: err.message || 'Failed to add member.' };
        }
    }
};
