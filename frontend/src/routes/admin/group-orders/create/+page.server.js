import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, fetch, cookies }) {
  const user = locals.authUser;
  if (!user || user.type !== 'staff') {
    throw error(403, 'Forbidden');
  }

  // 获取客户列表和布料列表
  const [customersRes, fabricsRes] = await Promise.all([
    api.customers.list({}, { fetch, cookies }),
    api.products.list({ fetch, cookies })
  ]);

  const customers = customersRes.customers ?? [];
  const fabrics = (fabricsRes.products ?? []).filter((p) => p.product_type === 'fabric');

  return { customers, fabrics };
}

export const actions = {
  default: async ({ locals, request, fetch, cookies }) => {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
      throw error(403, 'Forbidden');
    }

    const form = await request.formData();

    // 获取选中的客户信息
    const leaderId = Number(form.get('leader_id'));

    // 如果没有选择现有客户，需要提示错误
    if (!leaderId) {
      return { error: 'Please select a leader for the group order.' };
    }

    // 获取客户详情
    const customerRes = await api.customers.get(leaderId, { fetch, cookies });
    const leader = customerRes.customer;

    const payload = {
      leader_id: leaderId,
      leader_name: leader.full_name,
      leader_phone: leader.phone,
      leader_email: leader.email,
      group_name: form.get('group_name')?.trim(),
      event_name: form.get('event_name')?.trim() || null,
      expected_members: form.get('expected_members') ? Number(form.get('expected_members')) : null,
      fabric_selected: form.get('fabric_selected') || null,
      event_start: form.get('event_start') || null,
      event_end: form.get('event_end') || null,
      notes: form.get('notes')?.trim() || null
    };

    try {
      const res = await api.groupOrders.create(payload, { fetch, cookies });

      if (!res?.success && !res?.lastInsertRowid) {
        return { error: res?.error ?? 'Failed to create group order.' };
      }

      const orderId = res.lastInsertRowid || res.id;
      throw redirect(303, `/admin/group-orders/${orderId}`);
    } catch (err) {
      if (err.status === 303) throw err;
      return { error: err.message || 'Failed to create group order.' };
    }
  }
};