// backend/src/middleware/customerAuth.js
// =====================================================
// 前台客户鉴权中间件（与后台 staff 完全不同）
// 使用 access_token（HttpOnly Cookie）
// =====================================================

import CustomerAuthService from '../services/customerAuthService.js';
import CustomersDAO from '../data/customers-dao.js';

export function requireCustomerAuth(req, res, next) {
    const token = req.cookies?.access_token;

    if (!token) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    try {
        const decoded = CustomerAuthService.verifyAccess(token);
        console.log('[customerAuth] token payload:', decoded);

        // 检查客户是否仍存在
        const customer = CustomersDAO.getCustomerById(decoded.customerId);
        if (!customer || !customer.is_active) {
            return res.status(401).json({ error: 'Customer not found or inactive' });
        }

        // 注入 req.customer
        req.customer = {
            id: customer.id,
            full_name: customer.full_name,
            email: customer.email,
            phone: customer.phone
        };

        next();

    } catch (err) {
        console.error('Customer Auth failed:', err);
        return res.status(401).json({ error: 'Invalid or expired customer token' });
    }
}
