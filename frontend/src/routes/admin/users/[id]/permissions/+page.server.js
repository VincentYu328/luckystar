import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;

    if (!user || user.role !== 'admin') throw error(403);

    const detail = await api.users.get(params.id);
    const role = await api.users.role(params.id);
    const perms = await api.users.permissions(params.id);

    return { detail, role, perms };
}
