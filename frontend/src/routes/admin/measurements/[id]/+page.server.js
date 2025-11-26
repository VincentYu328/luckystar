// frontend/src/routes/admin/customers/[id]/measurements/+page.server.js
import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const customerId = params.id;

    // 获取客户
    const customer = await api.customers.get(customerId);
    if (!customer) {
        throw error(404, 'Customer not found');
    }

    // 获取该客户的量体记录
    const measurements = await api.measurements.byCustomer(customerId);

    return {
        customer,
        measurements: measurements || []
    };
}
