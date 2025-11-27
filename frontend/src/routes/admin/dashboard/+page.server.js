// src/routes/admin/dashboard/+page.server.js
import { redirect } from '@sveltejs/kit';
import { SERVER_API_URL } from '$env/static/private';

function buildCookieHeader(cookies) {
  return cookies
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
}

export async function load({ locals, fetch, cookies }) {
  const user = locals.authUser;

  // 未登录或不是员工 → 退回登录页（保持 redirect 逻辑一致）
  if (!user || user.type !== 'staff') {
    throw redirect(302, '/auth/login?redirect=/admin/dashboard');
  }

  const cookieHeader = buildCookieHeader(cookies);

  let stats = null;
  try {
    const resp = await fetch(`${SERVER_API_URL}/api/admin/stats/dashboard`, {
      headers: cookieHeader ? { cookie: cookieHeader } : {}
    });
    if (resp.ok) {
      stats = await resp.json();
    } else {
      console.error('dashboard stats fetch failed:', await resp.text());
    }
  } catch (err) {
    console.error('dashboard stats error:', err);
  }

  const safeStats = {
    today_orders: stats?.today_orders ?? 0,
    pending_orders: stats?.pending_orders ?? 0,
    total_products: stats?.total_products ?? 0,
    total_inventory_qty: stats?.total_inventory_qty ?? 0,
    today_sales: stats?.today_sales ?? 0
  };

  return {
    user,
    stats: safeStats
  };
}