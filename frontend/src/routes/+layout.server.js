import { verifyToken } from '$lib/server/auth.js';

/**
 * 全局 SSR 用户加载器
 * - 若存在 Token，则解析用户信息
 * - 若不存在 Token，则 user = null（前台正常浏览）
 * - 所有页面都可以通过 data.user 获取登录状态
 */
export async function load({ cookies }) {
  const token = cookies.get('token');
  let user = null;

  if (token) {
    try {
      user = await verifyToken(token);
    } catch (err) {
      // Token 无效或过期 → 清除 Cookie（可选）
      cookies.delete('token', { path: '/' });
      user = null;
    }
  }

  return { user };
}
