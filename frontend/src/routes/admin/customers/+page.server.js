// src/routes/admin/customers/+page.server.js
import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export const load = async ({ url, fetch, cookies, locals }) => {
    // 权限校验
    if (!locals.authUser || locals.authUser.type !== 'staff') {
        throw redirect(302, '/auth/login?redirect=/admin/customers');
    }

    const keyword = url.searchParams.get('keyword')?.trim() || '';

    // 调用后端 API 取全量客户
    const result = await api.customers.list({ fetch, cookies });
    let customers = result.customers ?? result.data ?? [];

    // 前端搜索过滤（后端暂无搜索功能时用这个）
    if (keyword) {
        const k = keyword.toLowerCase();
        customers = customers.filter(c =>
            c.full_name?.toLowerCase().includes(k) ||
            c.phone?.includes(keyword) ||
            c.email?.toLowerCase().includes(k)
        );
    }

    return {
        customers,
        keyword,
        deleteSuccess: url.searchParams.get('success') === '1',
        deleteError: url.searchParams.get('error') || null
    };
};

export const actions = {
    delete: async ({ request, url, fetch, cookies, locals }) => {
        // 权限校验
        if (!locals.authUser || locals.authUser.type !== 'staff') {
            throw redirect(302, '/auth/login?redirect=/admin/customers');
        }

        const form = await request.formData();
        const id = form.get('customer_id')?.toString();

        if (!id) {
            throw redirect(303, `/admin/customers?${url.searchParams}&error=${encodeURIComponent('无效ID')}`);
        }

        const res = await api.customers.delete({ fetch, cookies }, id);

        // 只有 API 返回失败才重定向带 error
        if (!res.success) {
            const search = url.searchParams.toString();
            throw redirect(303, `/admin/customers?${search}&error=${encodeURIComponent(res.error || '删除失败')}`);
        }

        // 成功：保留搜索词 + success 标记
        const search = url.searchParams.get('keyword')
            ? `keyword=${encodeURIComponent(url.searchParams.get('keyword'))}`
            : '';

        throw redirect(303, `/admin/customers?${search}&success=1`);
    }
};