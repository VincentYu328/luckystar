import { redirect, error } from '@sveltejs/kit';

export async function load({ params, locals, fetch, url }) {
  const user = locals.authUser;
  const orderId = params.id;

  // =============================
  // 未登录 → 去登录页
  // =============================
  if (!user || user.type !== 'customer') {
    const redirectTo = encodeURIComponent(url.pathname + url.search);
    throw redirect(302, `/auth/login?redirect=${redirectTo}`);
  }

  // =============================
  // 调用后端安全版 API
  // GET /api/customers/me/orders/:id
  // =============================
  const res = await fetch(`/api/customers/me/orders/${orderId}`, {
    credentials: 'include'
  });

  if (!res.ok) {
    throw error(res.status, 'Order not found');
  }

  const data = await res.json();

  // =============================
  // 权限检查：只能看自己的订单
  // =============================
  if (data.order.customer_id !== user.id) {
    throw error(403, 'You are not allowed to view this order.');
  }

  return {
    user,
    order: data.order,
    items: data.items ?? []
  };
}
