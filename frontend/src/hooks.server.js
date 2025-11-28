// src/hooks.server.js
import jwt from 'jsonwebtoken';
import { initApi } from '$lib/server/api.js';

/**
 * Lucky Star — 全局请求处理器
 * 模式 A（自动注入 fetch + cookies）
 */
export async function handle({ event, resolve }) {

  /* ============================================
     1) 初始化 API 模块（必须最先执行）
     ⭐ 模式 A 的核心：注入 fetch + cookies
     ============================================ */
  initApi(event.fetch, event.cookies);

  /* ============================================
     2) 解析用户身份（staff / customer）
     ============================================ */
  event.locals.authUser = null;

  const token = event.cookies.get('access_token');

  if (token) {
    try {
      const decoded = jwt.decode(token);

      if (!decoded) {
        event.cookies.delete('access_token', { path: '/' });

      } else if (decoded.userId) {
        event.locals.authUser = {
          id: decoded.userId,
          type: 'staff',
          role_name: decoded.role || 'staff',
          full_name: decoded.full_name,
          email: decoded.email
        };

      } else if (decoded.customerId) {
        event.locals.authUser = {
          id: decoded.customerId,
          type: 'customer',
          full_name: decoded.full_name,
          email: decoded.email
        };

      } else {
        event.cookies.delete('access_token', { path: '/' });
      }

    } catch (err) {
      console.error('⚠️ JWT decode error:', err);
      event.cookies.delete('access_token', { path: '/' });
    }
  }

  /* ============================================
     3) 返回响应
     ============================================ */
  return await resolve(event);
}

/**
 * 全局错误处理
 */
export function handleError({ error, event }) {
  console.error('⚠️ Server Error:', error);
  console.error('Request:', event.url.pathname);

  return {
    message: 'An unexpected error occurred. Please try again later.',
    code: error?.code ?? 'UNKNOWN_ERROR'
  };
}
