// backend/src/routes/customerAuthRoutes.js

import express from 'express';
import CustomerAuthService from '../services/customerAuthService.js';
import CustomersDAO from '../data/customers-dao.js';

const router = express.Router();

/**
 * ============================================================
 * 客户注册
 * POST /api/customer-auth/register
 * ============================================================
 */
router.post('/register', async (req, res) => {
  try {
    const { full_name, phone, email, password } = req.body;

    const { customer, tokens } = await CustomerAuthService.register({
      full_name,
      phone,
      email,
      password
    });

    const isProd = process.env.NODE_ENV === 'production';

    const cookieBase = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    };

    // JWT 注入 Cookie
    res.cookie('access_token', tokens.accessToken, {
      ...cookieBase,
      maxAge: 15 * 60 * 1000     // 15 mins
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      ...cookieBase,
      maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days
    });

    return res.json({ customer });

  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * ============================================================
 * 客户登录
 * POST /api/customer-auth/login
 * ============================================================
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { customer, tokens } = await CustomerAuthService.login(email, password);

    const isProd = process.env.NODE_ENV === 'production';

    const cookieBase = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    };

    // 写 Cookie
    res.cookie('access_token', tokens.accessToken, {
      ...cookieBase,
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      ...cookieBase,
      maxAge: 7 * 86400 * 1000
    });

    return res.json({ customer });

  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
});

/**
 * ============================================================
 * 刷新 Token
 * POST /api/customer-auth/refresh
 * ============================================================
 */
router.post('/refresh', (req, res) => {
  try {
    const refresh = req.cookies?.refresh_token;
    if (!refresh) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const { accessToken } = CustomerAuthService.refresh(refresh);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000
    });

    return res.json({ success: true });

  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
});

/**
 * ============================================================
 * 登出
 * POST /api/customer-auth/logout
 * ============================================================
 */
router.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  return res.json({ success: true });
});

/**
 * ============================================================
 * 获取当前客户信息（前端 SSR / 刷新页面使用）
 * GET /api/customer-auth/me
 * ============================================================
 */
router.get('/me', (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.json({ customer: null });

    const decoded = CustomerAuthService.verifyAccess(token);

    const customer = CustomersDAO.getCustomerById(decoded.customerId);
    if (!customer) return res.json({ customer: null });

    return res.json({
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        phone: customer.phone,
        email: customer.email,
        created_at: customer.created_at,
        type: customer.type
      }
    });

  } catch (_) {
    return res.json({ customer: null });
  }
});

export default router;
