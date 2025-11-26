// src/routes/my/+page.server.js
import { redirect } from '@sveltejs/kit';

export function load({ url }) {
  if (url.pathname === '/my') {
    throw redirect(307, '/my/cart');
  }
}
