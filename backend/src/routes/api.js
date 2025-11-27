// backend/src/routes/api.js

import express from 'express';

import authRoutes from './authRoutes.js';                   // 后台员工
import customerAuthRoutes from './customerAuthRoutes.js';   // 前台客户（注册/登录）

import userRoutes from './userRoutes.js';
import customerRoutes from './customerRoutes.js';
import productRoutes from './productRoutes.js';
import productImagesRoutes from './productImagesRoutes.js';  // ⭐ 新增：产品图片
import sizechartRoutes from './sizechartRoutes.js';
import measurementRoutes from './measurementRoutes.js';
import retailOrderRoutes from './retailOrderRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import auditRoutes from './auditRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

/**
 * ============================================================
 * 前台客户认证（注册 / 登录 / me）
 * ============================================================
 */
router.use('/customer-auth', customerAuthRoutes);

/**
 * ============================================================
 * 后台员工认证（管理后台）
 * ============================================================
 */
router.use('/auth', authRoutes);

/**
 * ============================================================
 * 业务模块
 * ============================================================
 */
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/product-images', productImagesRoutes);
router.use('/sizecharts', sizechartRoutes);

// ⭐ MeasurementRoutes 唯一挂载点
router.use('/measurements', measurementRoutes);

// 其余保持不动
router.use('/retail-orders', retailOrderRoutes);
router.use('/payments', paymentRoutes);
router.use('/audits', auditRoutes);
router.use('/admin', adminRoutes);

export default router;
