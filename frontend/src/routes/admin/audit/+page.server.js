import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    if (!user || user.role !== 'admin') {
        throw error(403, 'Forbidden');
    }

    const result = await api.audit.list();
    const logs = result?.logs ?? [];

    return { logs };
}
