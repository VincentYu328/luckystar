// src/routes/my/+layout.server.js
import { redirect } from '@sveltejs/kit';

export async function load({ locals, url, fetch, request }) {
  const authUser = locals.authUser;
  const redirectTo = encodeURIComponent(url.pathname + url.search);

  // 未登录 → 去登录页
  if (!authUser) {
    throw redirect(302, `/auth/login?redirect=${redirectTo}`);
  }

  // 员工不能访问 /my
  if (authUser.type === 'staff') {
    throw redirect(302, '/admin');
  }

  // 非顾客 → 重新登录
  if (authUser.type !== 'customer') {
    throw redirect(302, `/auth/login?redirect=${redirectTo}`);
  }

  // ============================
  // ⭐ SSR 拉取“最新客户资料”
  // ============================
  let freshUser = authUser;

  try {
    const resp = await fetch('http://localhost:3000/api/customers/me', {
      method: 'GET',
      headers: {
        // ⭐ 必须从 request 读取 cookie，不能用 url
        cookie: request.headers.get('cookie')
      }
    });

    if (resp.ok) {
      freshUser = await resp.json();
    }
  } catch (err) {
    console.error('SSR failed to load /api/customers/me:', err);
  }

  return {
    user: freshUser,
    profile: null
  };
}
