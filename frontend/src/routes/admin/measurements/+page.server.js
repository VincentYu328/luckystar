// frontend/src/routes/admin/measurements/+page.server.js
import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const measurements = await api.measurements.list();

    return {
        measurements: measurements || []
    };
}
