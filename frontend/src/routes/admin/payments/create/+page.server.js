import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // 获取零售订单列表供选择
    const orders = await api.retailOrders.list();

    return {
        retailOrders: orders?.orders ?? []
    };
}

export const actions = {
    create: async ({ locals, request }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const form = await request.formData();

        const payload = {
            order_type: 'retail', // 目前只有零售订单
            order_id: Number(form.get('order_id')),
            payment_type: form.get('payment_type'),
            payment_method: form.get('payment_method'),
            amount: Number(form.get('amount')),
            transfer_reference: form.get('transfer_reference'),
            notes: form.get('notes')
        };

        try {
            const res = await api.payments.create(payload);

            if (!res || !res.id) {
                return { error: 'Failed to create payment' };
            }

            throw redirect(303, `/admin/payments/${res.id}`);
        } catch (err) {
            return {
                error: err.message || 'Failed to create payment'
