import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, fetch, cookies }) {
  const user = locals.authUser;
  if (!user || user.type !== 'staff') {
    throw error(403, 'Forbidden');
  }

  // 获取成衣列表，供创建团体订单时选择主打产品
  const res = await api.products.list({ fetch, cookies });
  const garments = (res.products ?? []).filter((p) => p.product_type === 'garment');

  return { garments };
}

export const actions = {
  create: async ({ locals, request, fetch, cookies }) => {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
      throw error(403, 'Forbidden');
    }

    const form = await request.formData();
    const payload = {
      group_name: form.get('group_name')?.trim(),
      contact_name: form.get('contact_name')?.trim(),
      contact_phone: form.get('contact_phone')?.trim(),
      garment_id: form.get('garment_id'),
      notes: form.get('notes')?.trim() ?? ''
    };

    const res = await api.customers.createGroupOrder({ fetch, cookies }, payload);

    if (!res?.success) {
      return { error: res?.error ?? 'Failed to create group order.' };
    }

    throw redirect(303, `/admin/group-orders/${res.id}`);
  }
};