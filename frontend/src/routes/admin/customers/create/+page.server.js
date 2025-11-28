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

    console.log('[Edit Customer] Raw payload:', payload);

    // 🔥 关键修复：确保所有字段类型正确，is_active 转为整数 0/1
    const cleanPayload = {
      full_name: String(payload.full_name || '').trim(),
      phone: String(payload.phone || '').trim(),
      email: String(payload.email || '').trim(),
      address: payload.address && String(payload.address).trim() 
        ? String(payload.address).trim() 
        : null,
      wechat: payload.wechat && String(payload.wechat).trim() 
        ? String(payload.wechat).trim() 
        : null,
      whatsapp: payload.whatsapp && String(payload.whatsapp).trim() 
        ? String(payload.whatsapp).trim() 
        : null,
      // 🔥 核心修复：直接发送整数 0 或 1，而不是布尔值
      is_active: payload.is_active === '1' ? 1 : 0
    };

    console.log('[Edit Customer] Clean payload:', cleanPayload);

    // 验证必填字段
    if (!cleanPayload.full_name) {
      return { 
        success: false, 
        error: 'Full name is required', 
        values: payload,
        customer: null
      };
    }

    if (!cleanPayload.phone) {
      return { 
        success: false, 
        error: 'Phone is required', 
        values: payload,
        customer: null
      };
    }

    // 验证邮箱格式（如果提供）
    if (cleanPayload.email && !cleanPayload.email.includes('@')) {
      return { 
        success: false, 
        error: 'Invalid email format', 
        values: payload,
        customer: null
      };
    }

    try {
      const res = await api.customers.update(id, cleanPayload, { fetch, cookies });

      console.log('[Edit Customer] API response:', res);

      if (res.error) {
        return { 
          success: false, 
          error: res.error, 
          values: payload,
          customer: null
        };
      }

      // 重新获取更新后的客户数据
      const updated = await api.customers.get(id, { fetch, cookies });

      return {
        success: true,
        error: null,
        values: cleanPayload,
        customer: updated.customer ?? updated
      };

    } catch (err) {
      console.error('[Edit Customer] Error:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to update customer', 
        values: payload,
        customer: null
      };
    }
  }
};