// src/routes/my/orders/+page.server.js

import { redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
  const authUser = locals.authUser;

  // 未登录 → 重定向
  if (!authUser || authUser.type !== 'customer') {
    const redirectTo = encodeURIComponent(url.pathname + url.search);
    throw redirect(302, `/auth/login?redirect=${redirectTo}`);
  }

  // 注意：此处暂时不调用 /api/my/orders
  // 因为后端尚未实现该接口，会导致 JSON parse 错误
  return {
    user: authUser,
    orders: []   // 临时空数据，前端可以正常渲染
  };
}
