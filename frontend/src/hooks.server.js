// src/hooks.server.js
import jwt from 'jsonwebtoken';
import { initApi } from '$lib/server/api.js';

export async function handle({ event, resolve }) {

  /* ============================================
     1) 注入 fetch（必须最先执行）
     ============================================ */
  initApi(event.fetch);

  /* ============================================
     2) 初始化用户对象
     ============================================ */
  event.locals.authUser = null;

  const token = event.cookies.get('access_token');

  if (token) {
    try {
      const decoded = jwt.decode(token);

      if (!decoded) {
        // JWT 无法解析 → 清 token
        event.cookies.delete('access_token', { path: '/' });

      } else if (decoded.userId) {
        // 后台 Staff
        event.locals.authUser = {
          id: decoded.userId,
          type: 'staff',
          role: decoded.role || 'staff',
          full_name: decoded.full_name,
          email: decoded.email
        };

      } else if (decoded.customerId) {
        // 前台 Customer
        event.locals.authUser = {
          id: decoded.customerId,
          type: 'customer',
          full_name: decoded.full_name,
          email: decoded.email
        };

      } else {
        // token 格式怪异 → 删除
        event.cookies.delete('access_token', { path: '/' });
      }

    } catch (err) {
      console.error('JWT decode error:', err);
      event.cookies.delete('access_token', { path: '/' });
    }
  }

  /* ============================================
     3) 返回响应（让 SvelteKit 继续处理）
     ============================================ */
  return resolve(event);
}


/* ============================================
   全局错误捕获
   ============================================ */
export function handleError({ error }) {
  console.error('⚠️ Server Error:', error);
}
