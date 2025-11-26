// src/routes/auth/login/+page.server.js
import { redirect, fail } from '@sveltejs/kit';
import { SERVER_API_URL } from '$env/static/private';

export function load({ locals, url }) {
  const authUser = locals.authUser;
  const redirectTo = url.searchParams.get('redirect') || null;

  if (authUser) {
    if (redirectTo) throw redirect(302, redirectTo);
    if (authUser.type === 'customer') throw redirect(302, '/my');
    if (authUser.type === 'staff') throw redirect(302, '/admin');
  }

  return { redirectTo };
}

export const actions = {
  default: async ({ request, cookies, url }) => {
    const form = await request.formData();
    const email = form.get('email')?.trim();
    const password = form.get('password')?.trim();
    const isStaff = form.get('isStaff') === '1';

    const redirectTo =
      form.get('redirect')?.toString() ||
      url.searchParams.get('redirect') ||
      null;

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required' });
    }

    const apiURL = `${SERVER_API_URL}/api/auth/login${isStaff ? '/staff' : ''}`;
    
    // ⭐ 调试信息
    console.log('🔍 Login API URL:', apiURL);
    console.log('📧 Email:', email);
    console.log('👤 Is Staff:', isStaff);

    const res = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    console.log('📡 Response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Login failed:', errorText);
      return fail(401, { error: 'Invalid email or password' });
    }

    const data = await res.json();
    console.log('✅ Login response:', JSON.stringify(data, null, 2));

    cookies.set('access_token', data.access_token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    });

    console.log('🔀 Redirect to:', redirectTo);
    console.log('👤 User type:', data.user?.type);

    if (redirectTo) throw redirect(302, redirectTo);
    if (data.user?.type === 'customer') throw redirect(302, '/my');
    if (data.user?.type === 'staff') throw redirect(302, '/admin');

    throw redirect(302, '/');
  }
};