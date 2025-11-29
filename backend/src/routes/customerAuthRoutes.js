// backend/src/routes/customerAuthRoutes.js

import express from 'express';
// Assuming the Service and Middleware are set up correctly
import CustomerAuthService from '../services/customerAuthService.js';
import { requireCustomerAuth, verifyCustomerAuth } from '../middleware/customerAuth.js'; 

const router = express.Router();

// =====================================================
// Helper function to set secure HTTP-only cookies
// =====================================================
function setAuthCookies(res, tokens) {
    // 假设您的前端和后端都在同一个域或子域下
    // Access Token (短有效期, 用于认证)
    res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // 仅在生产环境启用 HTTPS
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });
    // Refresh Token (长有效期, 用于刷新)
    res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
}

// =====================================================
// POST /api/customer-auth/login - 客户登录
// =====================================================
router.post('/login', async (req, res) => {
    // ⭐ FIX 1: 确保 Express body parser 已经运行，并且 req.body 包含了 email 和 password
    const { email, password } = req.body; 

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        // ⭐ FIX 2: Service 层的 login(req.body) 接收对象参数
        const { customer, tokens } = await CustomerAuthService.login({ email, password });
        
        // 3. 设置 Cookies
        setAuthCookies(res, tokens);

        // 4. 返回精简的客户信息
        return res.status(200).json({
            customer: {
                id: customer.id,
                full_name: customer.full_name,
                email: customer.email,
                phone: customer.phone 
            }
        });

    } catch (error) {
        console.error('[CustomerAuthRoute /login] Login failed:', error.message);
        // 匹配 Service 层抛出的错误信息
        if (error.message.includes('Invalid')) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        return res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
});

// =====================================================
// POST /api/customer-auth/register - 客户注册
// =====================================================
router.post('/register', async (req, res) => {
    try {
        const { customer, tokens } = await CustomerAuthService.register(req.body);
        
        setAuthCookies(res, tokens);
        
        return res.status(201).json({ customer });

    } catch (error) {
        console.error('[CustomerAuthRoute /register] Registration failed:', error.message);
        if (error.message.includes('required') || error.message.includes('Email already')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Registration failed due to a server error.' });
    }
});


// =====================================================
// POST /api/customer-auth/logout - 客户登出
// =====================================================
router.post('/logout', (req, res) => {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.status(200).json({ success: true, message: "Logged out successfully." });
});


// =====================================================
// GET /api/customer-auth/me - 检查登录状态
// =====================================================
router.get('/me', requireCustomerAuth, (req, res) => {
    // If requireCustomerAuth passed, req.customer is populated
    return res.status(200).json({
        customer: req.customer 
    });
});


// =====================================================
// POST /api/customer-auth/refresh - 刷新 Token
// =====================================================
router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token missing.' });
    }

    try {
        const { accessToken } = CustomerAuthService.refresh(refreshToken);
        
        // Set new access token
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        return res.status(200).json({ success: true, message: "Token refreshed." });
    } catch (error) {
        console.error('[CustomerAuthRoute /refresh] Token refresh failed:', error.message);
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return res.status(401).json({ error: 'Invalid refresh token.' });
    }
});


export default router;