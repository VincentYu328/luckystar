import { redirect } from '@sveltejs/kit';
import { SERVER_API_URL } from '$env/static/private';

import { redirect } from '@sveltejs/kit';
import { SERVER_API_URL } from '$env/static/private';

export async function load({ locals, url, fetch, cookies }) {
  const authUser = locals.authUser;
  const redirectTo = encodeURIComponent(url.pathname + url.search);

  if (!authUser) {
    throw redirect(302, `/auth/login?redirect=${redirectTo}`);
  }

  if (authUser.type === 'staff') {
    throw redirect(302, '/admin');
  }

  if (authUser.type !== 'customer') {
    throw redirect(302, `/auth/login?redirect=${redirectTo}`);
  }

  const cookieHeader = cookies
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');

  console.log('[my layout] cookieHeader:', cookieHeader);

  let freshUser = authUser;

  try {
    const resp = await fetch(`${SERVER_API_URL}/api/customers/me`, {
      headers: cookieHeader ? { cookie: cookieHeader } : {}
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data) freshUser = data;
    } else {
      console.error('SSR load /api/customers/me failed:', await resp.text());
    }
  } catch (err) {
    console.error('SSR failed to load /api/customers/me:', err);
  }

  return {
    user: freshUser,
    profile: null
  };
}