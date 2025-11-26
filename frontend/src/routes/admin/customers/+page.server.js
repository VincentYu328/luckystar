// frontend/src/routes/admin/customers/+page.server.js
import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, url }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // 从 URL 获取搜索关键字
    const keyword = url.searchParams.get('keyword')?.trim() || '';

    let customers;

    if (keyword) {
        customers = await api.customers.search(keyword);
    } else {
        customers = await api.customers.list();
    }

    return {
        customers: customers || [],
        keyword   // 用于前端搜索框回显
    };
}
