// backend/src/middleware/customerAuth.js
// =====================================================
// 前台客户鉴权中间件 (修改版：允许 Admin/Staff 角色“借道”通过)
// =====================================================

import CustomerAuthService from '../services/customerAuthService.js';

/**
 * [Middleware] Requires a valid Customer JWT token.
 * * 修改逻辑：
 * 1. 检查 Token 是否存在。
 * 2. 如果角色是 'admin'/'staff'/'manager' -> 直接放行 (req.customer = null)。
 * 3. 如果角色是 'customer' -> 严格验证客户状态 (req.customer = {...})。
 * 4. 其他情况 -> 报错 401。
 */
export async function requireCustomerAuth(req, res, next) {
    const token = req.cookies?.access_token;

    if (!token) {
        console.log('[CustomerAuth] Access denied: No token provided.');
        return res.status(401).json({ error: 'Unauthorized: Access token missing.' });
    }

    try {
        // 1. 验证 Token (同步/异步取决于 Service 实现，此处假设同步返回 decoded)
        const decoded = CustomerAuthService.verifyAccess(token);
        
        // ============================================================
        // ⭐ 新增逻辑：允许 Admin/Staff 角色通过
        // ============================================================
        // 定义哪些非客户角色可以访问此接口
        const validStaffRoles = ['admin', 'staff', 'manager', 'superadmin']; 

        if (decoded.role && validStaffRoles.includes(decoded.role)) {
            console.log(`[CustomerAuth] 🛡️ Admin/Staff Override: Role '${decoded.role}' allowed access.`);
            
            // 将 Token 信息注入 req.user，以便后续权限检查 (ACL) 使用
            req.user = decoded; 
            
            // ⚠️ 关键点：管理员不是客户，所以 req.customer 为空。
            // 确保后续 Controller 不要强行读取 req.customer.id
            req.customer = null; 
            
            return next(); 
        }
        // ============================================================

        // 2. 严格检查：如果不是 Staff，那必须是 Customer
        if (decoded.role !== 'customer') {
            console.log(`[CustomerAuth] Access denied: Role '${decoded.role}' is not a customer.`);
            return res.status(401).json({ error: 'Unauthorized: Token role mismatch.' });
        }

        // 3. 获取并验证客户数据
        const customer = CustomerAuthService.getCustomerByCustomerId(decoded.customerId); 
        
        if (!customer || !customer.is_active) {
            console.log(`[CustomerAuth] Access denied: Customer ID ${decoded.customerId} not found or inactive.`);
            return res.status(401).json({ error: 'Unauthorized: Customer not found or inactive.' });
        }

        // 4. 注入客户数据
        req.customer = {
            id: customer.id,
            full_name: customer.full_name,
            email: customer.email,
            phone: customer.phone
        };
        
        // 兼容性注入 req.user
        req.user = { 
            id: customer.id, 
            role: 'customer', 
            customerId: customer.id 
        };

        next();

    } catch (err) {
        console.error('[CustomerAuth] Token verification failed:', err.message);
        // 清除无效 Token
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    }
}

/**
 * [Middleware] Verifies a Customer JWT token if present, but does not enforce it.
 * (Optional use)
 */
export function verifyCustomerAuth(req, res, next) {
    const token = req.cookies?.access_token;
    
    if (!token) {
        return next();
    }

    try {
        const decoded = CustomerAuthService.verifyAccess(token);
        
        // 同样允许 Staff 即使在这里也被解析
        const validStaffRoles = ['admin', 'staff', 'manager', 'superadmin'];
        if (decoded.role && validStaffRoles.includes(decoded.role)) {
            req.user = decoded;
            return next();
        }

        if (decoded.role === 'customer') {
            const customer = CustomerAuthService.getCustomerByCustomerId(decoded.customerId);
            if (customer && customer.is_active !== 0) {
                req.customer = customer;
                req.user = { id: customer.id, role: 'customer', customerId: customer.id };
            }
        }
        next();
    } catch (error) {
        // Soft failure
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        next();
    }
}