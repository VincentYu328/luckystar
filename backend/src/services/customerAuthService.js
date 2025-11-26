// backend/src/services/customerAuthService.js

import bcrypt from 'bcrypt';
import CustomersDAO from '../data/customers-dao.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} from '../utils/jwt.js';

class CustomerAuthService {

  // =====================================================
  // Token 生成（客户版）
  // =====================================================
  static issueTokens(customer) {
    return {
      accessToken: signAccessToken({
        customerId: customer.id,
        role: 'customer',       // 固定
        full_name: customer.full_name,
        email: customer.email
      }),
      refreshToken: signRefreshToken({
        customerId: customer.id
      })
    };
  }

  // =====================================================
  // 注册客户（前台用户）
  // =====================================================
  static async register({ full_name, phone, email, password }) {
    if (!full_name || !phone || !email || !password) {
      throw new Error('Missing required fields');
    }

    const existing = CustomersDAO.getCustomerByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = CustomersDAO.createCustomer({
      full_name,
      phone,
      email,
      address: null,
      wechat: null,
      whatsapp: null,
      type: 'retail',
      password_hash    // ★ 新增字段（需确保 DB 已添加此列）
    });

    const id = result.lastInsertRowid;

    const newCustomer = CustomersDAO.getCustomerById(id);

    const tokens = this.issueTokens(newCustomer);

    return {
      customer: {
        id,
        full_name,
        phone,
        email
      },
      tokens
    };
  }

  // =====================================================
  // 客户登录
  // =====================================================
  static async login(email, password) {
    const customer = CustomersDAO.getCustomerByEmail(email);

    if (!customer || !customer.password_hash) {
      throw new Error('Invalid email or password');
    }

    const ok = await bcrypt.compare(password, customer.password_hash);
    if (!ok) throw new Error('Invalid email or password');

    const tokens = this.issueTokens(customer);

    return {
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone
      },
      tokens
    };
  }

  // =====================================================
  // 刷新 access token
  // =====================================================
  static refresh(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);

    const customer = CustomersDAO.getCustomerById(decoded.customerId);
    if (!customer) throw new Error('Customer not found');

    const accessToken = signAccessToken({
      customerId: customer.id,
      role: 'customer',
      full_name: customer.full_name,
      email: customer.email
    });

    return { accessToken };
  }

  // =====================================================
  // SSR / API 校验客户 token
  // =====================================================
  static verifyAccess(token) {
    return verifyAccessToken(token);
  }
}

export default CustomerAuthService;
