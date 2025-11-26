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

    const apiPath = isStaff ? '/api/auth/login' : '/api/customer-auth/login';
    const apiURL = `${SERVER_API_URL}${apiPath}`;
    
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

    const applySetCookie = (cookieStr) => {
      const parts = cookieStr.split(';').map((part) => part.trim()).filter(Boolean);
      if (!parts.length) return;

      const [nameValue, ...attrParts] = parts;
      const [rawName, ...rawValueParts] = nameValue.split('=');
      const name = rawName;
      const value = rawValueParts.join('=');

      if (!name) return;

      const opts = { path: '/' };

      for (const attr of attrParts) {
        const [attrName, ...attrValueParts] = attr.split('=');
        const attrValue = attrValueParts.join('=');
        switch (attrName.toLowerCase()) {
          case 'path':
            opts.path = attrValue || '/';
            break;
          case 'domain':
            opts.domain = attrValue;
            break;
          case 'max-age':
            opts.maxAge = Number(attrValue);
            break;
          case 'expires':
            opts.expires = new Date(attrValue);
            break;
          case 'secure':
            opts.secure = true;
            break;
          case 'httponly':
            opts.httpOnly = true;
            break;
          case 'samesite': {
            const valueLower = attrValue?.toLowerCase();
            if (valueLower === 'none' || valueLower === 'lax' || valueLower === 'strict') {
              opts.sameSite = valueLower;
            }
            break;
          }
        }
      }

      cookies.set(name, value, opts);
    };

    const cookieHeaders =
      (typeof res.headers.getSetCookie === 'function' && res.headers.getSetCookie()) ||
      res.headers.raw?.()['set-cookie'] ||
      (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);

    cookieHeaders.forEach(applySetCookie);

    const userType = data.user ? 'staff' : 'customer';
    const profile = data.user ?? data.customer ?? null;

    console.log('🔀 Redirect to:', redirectTo);
    console.log('👤 User type:', userType);

    if (redirectTo) throw redirect(302, redirectTo);
    if (profile && userType === 'customer') throw redirect(302, '/my');
    if (profile && userType === 'staff') throw redirect(302, '/admin');

    throw redirect(302, '/');
  }
};