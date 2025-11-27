/**
 * 返回 SSR 当前登录用户（由 hooks.server.js 设置）
 * 不读取 cookie，不 decode，不 verify —— 统一入口只有 hooks.server.js
 */
export function getUser(event) {
    return event.locals?.authUser ?? null;
}

/**
 * 为 hooks.server.js 提供的安全验证函数
 * 后端环境会用它 verify JWT
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function verifyTokenSSR(token) {
    return jwt.verify(token, JWT_SECRET);
}
