// frontend/src/routes/admin/customers/[id]/measurements/create/+page.server.js
// 终极稳定版：创建成功后不跳转，直接返回成功信息，前端自动处理

import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export const load = ({ locals, params }) => {
  const user = locals.authUser;
  if (!user || user.type !== 'staff') {
    throw error(403, 'Forbidden');
  }

  const customer_id = Number(params.id);
  if (!customer_id || isNaN(customer_id)) {
    throw error(400, '无效的客户ID');
  }

  return { customer_id };
};

export const actions = {
  default: async ({ locals, params, request }) => {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
      throw error(403, 'Forbidden');
    }

    const customer_id = Number(params.id);
    const form = await request.formData();

    // 转换 formData → 干净对象
    const payload = {};
    for (const [key, value] of form.entries()) {
      payload[key] = value === '' ? null : value.trim();
    }

    console.log('Measurement create payload:', payload);

    try {
      const res = await api.measurements.createForCustomer(customer_id, payload);

      console.log('Measurement created:', res);

      const measurementId = res.id ?? res.measurement?.id ?? res.data?.id;

      if (!measurementId) {
        console.warn('创建成功但未返回ID:', res);
      }

      // 关键修改：不 throw redirect！
      // 直接返回成功，前端决定怎么处理（toast + 自动刷新列表）
      return {
        success: true,
        message: '量体记录创建成功！',
        measurementId,
        // 可选：把新数据返回，前端直接追加到列表，不用重新请求
        newMeasurement: res.measurement ?? res
      };

    } catch (err) {
      console.error('创建量体记录失败:', err);

      return {
        success: false,
        error: err.message || '创建失败，请重试',
        values: payload  // 保留表单数据
      };
    }
  }
};