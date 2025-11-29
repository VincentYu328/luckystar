// backend/src/middleware/customerAuth.js
// =====================================================
// 前台客户鉴权中间件（与后台 staff 完全不同）
// 修正：适配同步 DAO 调用
// =====================================================

import CustomerAuthService from '../services/customerAuthService.js';
// 导入所有 JWT 校验的函数 (虽然 Service 中已封装，但为了清晰保留)
import * as jwtUtil from '../utils/jwt.js'; 


/**
 * [Middleware] Requires a valid Customer JWT token.
 * @returns 401 Unauthorized if token is missing, invalid, or customer is inactive.
 */
export async function requireCustomerAuth(req, res, next) {
    const token = req.cookies?.access_token;

    if (!token) {
        console.log('[CustomerAuth] Access denied: No token provided.');
        return res.status(401).json({ error: 'Unauthorized: Access token missing.' });
    }

    try {
        // 1. 验证 Token (同步操作)
        const decoded = CustomerAuthService.verifyAccess(token);
        console.log('[customerAuth] token payload:', decoded);

        // Check if the token payload is for a customer
        if (decoded.role !== 'customer') {
            console.log('[CustomerAuth] Access denied: Invalid token role.');
            return res.status(401).json({ error: 'Unauthorized: Token role mismatch.' });
        }

        // 2. 获取客户数据 (同步操作 - 适配同步 DAO)
        // ⭐ FIX: 移除 await，因为 Service/DAO 是同步的
        const customer = CustomerAuthService.getCustomerByCustomerId(decoded.customerId); 
        
        if (!customer || !customer.is_active) {
            console.log(`[CustomerAuth] Access denied: Customer ID ${decoded.customerId} not found or inactive.`);
            return res.status(401).json({ error: 'Unauthorized: Customer not found or inactive.' });
        }

        // 3. 附加客户数据
        req.customer = {
            id: customer.id,
            full_name: customer.full_name,
            email: customer.email,
            phone: customer.phone
        };
        
        // 附加 req.user 以兼容依赖 req.user 的下游路由，例如 requireAuth 中的 isSelf()
        req.user = { 
            id: customer.id, 
            role: 'customer', 
            customerId: customer.id 
        };

        next();
    } catch (err) {
        console.error('[CustomerAuth] Token verification failed:', err.message);
        // 清除 Token 以强制重新登录
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    }
}

/**
 * [Middleware] Verifies a Customer JWT token if present, but does not enforce it.
 * (This middleware is not currently used in the provided customerRoutes.js but is kept for completeness)
 */
export function verifyCustomerAuth(req, res, next) {
    const token = req.cookies?.access_token;
    
    if (!token) {
        return next();
    }

    try {
        // Synchronous verification
        const decoded = CustomerAuthService.verifyAccess(token);
        
        if (decoded.role === 'customer') {
            // Synchronous DAO call
            const customer = CustomerAuthService.getCustomerByCustomerId(decoded.customerId);
            
            if (customer && customer.is_active !== 0) {
                req.customer = customer;
                req.user = { id: customer.id, role: 'customer', customerId: customer.id };
            }
        }
        next();
    } catch (error) {
        // Soft failure: clear cookies and continue
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        next();
    }
}