// src/hooks.server.js
import jwt from 'jsonwebtoken';

export async function handle({ event, resolve }) {
  const token = event.cookies.get('access_token');

  // ⭐ 改成 authUser，与 +page.server.js 保持一致
  event.locals.authUser = null;

  if (!token) {
    return resolve(event);
  }

  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      event.cookies.delete('access_token', { path: '/' });
      return resolve(event);
    }

    // STAFF
    if (decoded.userId) {
      event.locals.authUser = {
        id: decoded.userId,
        type: 'staff',
        role: decoded.role || 'staff',
        full_name: decoded.full_name,
        email: decoded.email
      };
    }
    // CUSTOMER
    else if (decoded.customerId) {
      event.locals.authUser = {
        id: decoded.customerId,
        type: 'customer',
        full_name: decoded.full_name,
        email: decoded.email
      };
    }
    // 结构不对
    else {
      event.cookies.delete('access_token', { path: '/' });
    }

  } catch (err) {
    console.error('JWT decode error:', err);
    event.cookies.delete('access_token', { path: '/' });
  }

  return resolve(event);
}

export function handleError({ error }) {
  console.error('⚠️ Server Error:', error);
}