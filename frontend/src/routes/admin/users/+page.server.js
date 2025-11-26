import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff' || user.role !== 'admin') {
        throw error(403, 'Forbidden');
    }

    const result = await api.users.list();
    const users = result?.users ?? [];

    return { users };
}
