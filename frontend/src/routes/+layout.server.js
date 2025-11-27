// frontend/src/routes/+layout.server.js

import jwt from 'jsonwebtoken';

export async function load({ cookies }) {
  const access = cookies.get('access_token');      // ⭐ 正确的名字
  let user = null;

  if (access) {
    try {
      const decoded = jwt.decode(access);

      // staff
      if (decoded?.userId) {
        user = {
          id: decoded.userId,
          type: 'staff',
          role: decoded.role || 'staff',
          full_name: decoded.full_name,
          email: decoded.email
        };
      }

      // customer
      if (decoded?.customerId) {
        user = {
          id: decoded.customerId,
          type: 'customer',
          full_name: decoded.full_name,
          email: decoded.email
        };
      }

    } catch (err) {
      cookies.delete('access_token', { path: '/' });
    }
  }

  return { user };
}
