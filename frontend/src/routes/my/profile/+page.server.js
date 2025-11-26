// src/routes/my/profile/+page.server.js
import { redirect, fail } from '@sveltejs/kit';
import { SERVER_API_URL } from '$env/static/private';

export async function load({ locals, url }) {
  const authUser = locals.authUser;

  if (!authUser || authUser.type !== 'customer') {
    const redirectTo = encodeURIComponent(url.pathname + url.search);
    throw redirect(302, `/auth/login?redirect=${redirectTo}`);
  }

  return {
    user: authUser
  };
}

export const actions = {
  save: async ({ request, locals, fetch, cookies }) => {
    const user = locals.authUser;
    if (!user || user.type !== 'customer') {
      throw redirect(302, '/auth/login');
    }

    const form = await request.formData();
    const full_name = form.get('full_name')?.trim() ?? '';
    const phone = form.get('phone')?.trim() ?? '';

    if (!full_name) {
      return fail(400, { error: 'Full name is required.' });
    }

    // ⭐ 使用环境变量 SERVER_API_URL（本地/线上自动切换）
    const apiUrl = `${SERVER_API_URL}/api/customers/me`;

    const res = await fetch(apiUrl, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',

        // 必须手动带 Session Cookie（SSR 才能携带）
        cookie: cookies.get('session')
          ? `session=${cookies.get('session')}`
          : ''
      },
      body: JSON.stringify({ full_name, phone })
    });

    if (!res.ok) {
      console.error('Profile update failed:', await res.text());
      return fail(500, { error: 'Failed to update profile.' });
    }

    throw redirect(303, '/my/profile');
  }
};
