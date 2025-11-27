// frontend/src/routes/admin/customers/[id]/edit/+page.server.js
import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals, fetch, cookies }) {
  const user = locals.authUser;
  if (!user || user.type !== 'staff') {
    throw error(403, 'Forbidden');
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    throw error(400, 'Invalid customer id');
  }

  // ⭐ FIXED: 正确传参方式
  const customerRes = await api.customers.get(id, { fetch, cookies });
  const customer = customerRes.customer ?? customerRes;

  if (!customer) throw error(404, 'Customer not found');

  return {
    customer,
    error: null,
    success: false,
    values: null
  };
}

export const actions = {
  default: async ({ params, request, locals, fetch, cookies }) => {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
      throw error(403, 'Forbidden');
    }

    const id = Number(params.id);
    const form = await request.formData();
    const payload = Object.fromEntries(form);

    const cleanPayload = {
      full_name: payload.full_name,
      phone: payload.phone,
      email: payload.email,
      address: payload.address || null,
      wechat: payload.wechat || null,
      whatsapp: payload.whatsapp || null,
      is_active: payload.is_active === '1'
    };

    try {
      // ⭐ FIXED: update 也要改正确
      const res = await api.customers.update(id, cleanPayload, { fetch, cookies });

      if (res.error) {
        return { success: false, error: res.error, values: payload };
      }

      const updated = await api.customers.get(id, { fetch, cookies });

      return {
        success: true,
        error: null,
        values: cleanPayload,
        customer: updated.customer ?? updated
      };

    } catch (err) {
      return { success: false, error: err.message, values: payload };
    }
  }
};
