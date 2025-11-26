// frontend/src/routes/auth/logout/+page.server.js
import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ cookies }) => {
    // 直接清除所有 cookies
    cookies.delete('access_token', { path: '/' });
    cookies.delete('refresh_token', { path: '/' });
    cookies.delete('customer_access_token', { path: '/' });
    cookies.delete('customer_refresh_token', { path: '/' });

    throw redirect(303, '/');
  }
};

// GET 请求也重定向
export async function load({ cookies }) {
  cookies.delete('access_token', { path: '/' });
  cookies.delete('refresh_token', { path: '/' });
  cookies.delete('customer_access_token', { path: '/' });
  cookies.delete('customer_refresh_token', { path: '/' });

  throw redirect(303, '/');
}