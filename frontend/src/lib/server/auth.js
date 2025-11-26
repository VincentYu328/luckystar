// src/lib/server/auth.js

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * SSR：从 locals 或 cookies 中获取当前用户
 * 仅用于 UI 渲染，不做安全验证
 */
export function getUserFromLocals(event) {
    try {
        // 后端 hooks 已经 verify 过，直接读
        if (event.locals?.user) {
            return event.locals.user;
        }

        // SSR fallback：读取 cookies 中的 access_token
        const token = event.cookies.get('access_token');
        if (!token) return null;

        // 不 verify，只 decode
        const decoded = jwt.decode(token);
        if (!decoded) return null;

        return {
            id: decoded.userId,
            role: decoded.role,
            full_name: decoded.full_name,
            email: decoded.email
        };
    } catch (err) {
        console.error('SSR auth decode failed:', err);
        return null;
    }
}

/**
 * SSR：用于 hooks.server.js 验证 token 的安全版本
 * 如果 decode 失败会抛出错误
 */
export function verifyTokenSSR(token) {
    return jwt.verify(token, JWT_SECRET);
}
