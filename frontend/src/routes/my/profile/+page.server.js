import { redirect, fail } from '@sveltejs/kit';
import { SERVER_API_URL } from '$env/static/private';

function buildCookieHeader(cookies) {
  const pairs = cookies.getAll().map(({ name, value }) => `${name}=${value}`);
  return pairs.length ? pairs.join('; ') : '';
}

export async function load({ locals, url, fetch, cookies }) {
  const authUser = locals.authUser;

  if (!authUser || authUser.type !== 'customer') {
    const redirectTo = encodeURIComponent(url.pathname + url.search);
    throw redirect(302, `/auth/login?redirect=${redirectTo}`);
  }

  let profile = {
    id: authUser.id,
    full_name: authUser.full_name,
    email: authUser.email,
    phone: authUser.phone ?? ''
  };

  const cookieHeader = buildCookieHeader(cookies);

  try {
    const resp = await fetch(`${SERVER_API_URL}/api/customers/me`, {
      headers: cookieHeader ? { cookie: cookieHeader } : {}
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data) profile = data;
    } else {
      console.error('Profile load failed:', await resp.text());
      console.log('[profile action] cookieHeader:', cookieHeader);
    }
  } catch (err) {
    console.error('Profile load error:', err);
  }

  const successMessage =
    url.searchParams.get('saved') === '1'
      ? 'Your profile has been updated.'
      : null;

  return {
    user: profile,
    successMessage
  };
}

export const actions = {
  default: async ({ request, locals, fetch, cookies }) => {
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

    const apiUrl = `${SERVER_API_URL}/api/customers/me`;
    const cookieHeader = buildCookieHeader(cookies);

    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader ? { cookie: cookieHeader } : {})
      },
      body: JSON.stringify({ full_name, phone })
    });

    if (!res.ok) {
      console.error('Profile update failed:', await res.text());
      return fail(500, { error: 'Failed to update profile.' });
    }

    throw redirect(303, '/my/profile?saved=1');
  }
};