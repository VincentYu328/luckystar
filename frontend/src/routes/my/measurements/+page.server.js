import { redirect } from '@sveltejs/kit';

export async function load({ locals, url, fetch }) {
  const user = locals.authUser;

  // 必须是 customer
  if (!user || user.type !== 'customer') {
    const redirectTo = encodeURIComponent(url.pathname + url.search);
    throw redirect(302, `/auth/login?redirect=${redirectTo}`);
  }

  // =============================
  // SSR 调用后端真实 API
  // GET /api/customers/me/measurements
  // =============================
  const res = await fetch(`/api/customers/me/measurements`, {
    credentials: 'include'
  });


  
  let measurements = null;

  if (res.ok) {
    const data = await res.json();
    measurements = data.measurements || null;
  }

  return {
    user,
    measurements
  };
}
