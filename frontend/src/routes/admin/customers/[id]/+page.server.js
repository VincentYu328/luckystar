// frontend/src/routes/admin/customers/[id]/+page.server.js
// 这是「客户详情页」的 server load

import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
  const user = locals.authUser;
  if (!user || user.type !== 'staff') {
    throw error(403, 'Forbidden');
  }

  const id = Number(params.id);
  if (!id || isNaN(id)) {
    throw error(400, 'Invalid customer ID');
  }

  try {
    // 并发请求：客户信息 + 量体记录 + 团购订单
    const [customerRes, measurementsRes, groupOrdersRes] = await Promise.all([
      api.customers.get(id),                    // 返回 { customer: { ... } }
      api.measurements.byCustomer(id),          // 返回 { measurements: [...] } 或数组
      api.customers.groupOrders(id)             // 返回 { orders: [...] } 或数组
    ]);

    return {
      customer: customerRes.customer ?? customerRes,                    // 兼容新旧格式
      measurements: measurementsRes.measurements ?? measurementsRes ?? [],
      groupOrders: groupOrdersRes.orders ?? groupOrdersRes ?? []
    };

  } catch (err) {
    console.error('Failed to load customer detail:', err);
    if (err.status) throw err;
    throw error(500, '无法加载客户信息');
  }
}