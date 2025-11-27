// backend/src/routes/authRoutes.js
import express from 'express';
import AuthService from '../services/authService.js';
import UsersDAO from '../data/users-dao.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * 登录
 */
// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await AuthService.login(email, password);

    const isProd = process.env.NODE_ENV === 'production';

    const cookieSettings = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/'            // ⭐⭐ 关键补充，全站有效
    };
    res.cookie('access_token', tokens.accessToken, cookieSettings);
    res.cookie('refresh_token', tokens.refreshToken, { ...cookieSettings, maxAge: 7 * 86400 * 1000 });

    return res.json({ user });

  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
});

/**
 * 刷新 Access Token
 */
router.post('/refresh', (req, res) => {
  try {
    const refresh = req.cookies?.refresh_token;
    if (!refresh) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const { accessToken } = AuthService.refreshToken(refresh);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
});

/**
 * 登出
 */
router.post('/logout', (req, res) => {
  const token = req.cookies?.access_token;

  if (token) {
    try {
      const decoded = AuthService.verifyAccess(token);
      UsersDAO.logAction({
        userId: decoded.userId,
        action: 'logout',
        targetType: 'user',
        targetId: decoded.userId
      });
    } catch (_) { }
  }

  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
  return res.json({ success: true });
});

/**
 * 当前登录用户信息
 */
router.get('/me', (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.json({ user: null });

    const decoded = AuthService.verifyAccess(token);
    const user = UsersDAO.getUserById(decoded.userId);
    if (!user) return res.json({ user: null });

    return res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        position: user.position_name,
        role: user.role_name,
        must_change_password: user.must_change_password,
        is_active: user.is_active
      }
    });
  } catch (_) {
    return res.json({ user: null });
  }
});

/**
 * 修改密码（首次登录 or 用户自行修改）
 */
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    await AuthService.changePassword(req.user.id, oldPassword, newPassword);

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * 管理员强制重置某员工密码
 */
router.post('/force-reset/:id', requireAuth, async (req, res) => {
  try {
    const adminId = req.user.id;
    const targetId = Number(req.params.id);
    const { newPassword } = req.body;

    await AuthService.adminForceResetPassword(adminId, targetId, newPassword);

    return res.json({ success: true });
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }
});

export default router;
