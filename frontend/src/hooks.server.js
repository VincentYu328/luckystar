// src/hooks.server.js (最终完整版 - 包含 Refresh Token 机制和调试输出)

import jwt from 'jsonwebtoken';
import { initApi } from '$lib/server/api.js';

// ⚡ 关键修正：使用静态导入，从 .env 文件读取密钥
import { JWT_SECRET, JWT_REFRESH_SECRET } from '$env/static/private';

// 🚨 使用 Access Token 的密钥进行验证
// JWT_SECRET 已经从 .env 中加载，并且在后端代码中也已同步为 'dev-key-123'
const ACCESS_TOKEN_SECRET = JWT_SECRET || 'dev-key-123';

// 🎯 临时调试：确保 SvelteKit 看到正确的密钥
console.log(`[DEBUG] SvelteKit Access Secret: ${ACCESS_TOKEN_SECRET}`);

/* ============================================================
 * 辅助函数：尝试刷新 Access Token
 * ============================================================ */
async function attemptTokenRefresh(event) {
  const refreshToken = event.cookies.get('refresh_token');

  if (!refreshToken) return false;

  try {
    // 调用后端 Refresh API。event.fetch 会自动携带 refresh_token cookie
    const res = await event.fetch('/api/auth/refresh', {
      method: 'POST'
    });

    if (res.ok) {
      console.log('✅ Access Token successfully refreshed.');
      // 后端已经通过 Set-Cookie Header 设置了新的 access_token Cookie。
      const newAccessToken = event.cookies.get('access_token');

      if (newAccessToken) {
        // 验证新的 Access Token
        const decoded = jwt.verify(newAccessToken, ACCESS_TOKEN_SECRET);

        // 成功设置新的 locals.authUser
        if (decoded.userId) {
          event.locals.authUser = {
            id: decoded.userId,
            type: 'staff',
            role: decoded.role || 'staff',
            role_name: decoded.role_name || decoded.role || 'staff',
            full_name: decoded.full_name,
            email: decoded.email
          };
          return true;
        }
      }
    }
  } catch (e) {
    // 刷新过程中发生错误（如 Refresh Token 无效或过期）
    console.warn('❌ Refresh Token failed. Clearing tokens.', e.message);
    event.cookies.delete('access_token', { path: '/' });
    event.cookies.delete('refresh_token', { path: '/' });
  }
  return false;
}

/* ============================================================
 * Lucky Star — 全局请求处理器
 * ============================================================ */
export async function handle({ event, resolve }) {

  initApi(event.fetch, event.cookies);
  event.locals.authUser = null;

  const token = event.cookies.get('access_token');
  const refreshToken = event.cookies.get('refresh_token'); // 获取 Refresh Token 以供调试

  if (token) {

    // 🎯 临时调试：打印收到的 Token，用于手动验证！
    console.log(`[DEBUG] Received Access Token (Start): ${token.substring(0, 30)}...`);
    console.log(`[DEBUG] Full Access Token (Copy to jwt.io): ${token}`);

    try {
      // ⚡ 验证签名和过期时间
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

      // Token 验证成功，设置用户数据...
      if (decoded.userId) {
        event.locals.authUser = {
          id: decoded.userId,
          type: 'staff',
          role: decoded.role || 'staff',
          role_name: decoded.role_name || decoded.role || 'staff',
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
      }
      // 验证成功，继续处理请求

    } catch (err) {
      console.error('⚠️ Access Token validation error:', err.name, 'Message:', err.message);

      // 1. 如果是过期错误 (TokenExpiredError)，则尝试刷新 (不掉线机制)
      if (err.name === 'TokenExpiredError') {
        console.log('⏳ Access Token expired. Attempting refresh...');
        const refreshed = await attemptTokenRefresh(event);

        if (refreshed) {
          // 刷新成功，返回，请求继续处理
          return await resolve(event);
        }
      }

      // 2. 如果是签名错误 (JsonWebTokenError) 或刷新失败，清除所有 Token
      // JsonWebTokenError (invalid signature) 意味着 Token 已被篡改或密钥不匹配，必须清除。
      console.warn('❌ Token invalid or refresh failed. Clearing tokens.');
      event.cookies.delete('access_token', { path: '/' });
      event.cookies.delete('refresh_token', { path: '/' });
    }
  }

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