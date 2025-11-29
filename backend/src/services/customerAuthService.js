// backend/src/services/customerAuthService.js
// =====================================================
// 前台客户鉴权服务（CustomerAuthService）
// 整合了注册、登录、Token 发放与校验的核心逻辑
// =====================================================

// NOTE: 假设 bcrypt 已安装并可用
import bcrypt from 'bcrypt'; 
import CustomersDAO from '../data/customers-dao.js';
// ⚠️ 依赖于自定义的 JWT 模块导出了以下函数
import {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
} from '../utils/jwt.js';

// 导入其他依赖
import { isValidEmail } from '../utils/validate.js';
// 环境变量 (用于中间件 CustomerAuth.js)
const JWT_SECRET = process.env.SECRET_JWT_KEY || 'default-secret-key-please-change';
const TOKEN_EXPIRY = process.env.CUSTOMER_TOKEN_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.CUSTOMER_REFRESH_EXPIRY || '7d';

class CustomerAuthService {

    // =====================================================
    // 基础查询 (用于中间件 req.customer 校验)
    // =====================================================
    static getCustomerByCustomerId(customerId) {
        // NOTE: Assumes CustomersDAO has a method getCustomerById(id)
        return CustomersDAO.getCustomerById(customerId); 
    }

    // =====================================================
    // Token 生成（客户版）
    // =====================================================
    static issueTokens(customer) {
        return {
            accessToken: signAccessToken({
                customerId: customer.id,
                role: 'customer',       // 固定角色
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
        if (!isValidEmail(email)) {
            throw new Error('Invalid email format.');
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
            password_hash    
        });

        const id = result.lastInsertRowid;

        // 重新查询确保数据完整
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
    // 客户登录 (FIXED: 使用对象解构 { email, password } 保持一致性)
    // =====================================================
    static async login({ email, password }) {
        if (!isValidEmail(email)) {
            throw new Error('Invalid credentials.');
        }
        
        const customer = CustomersDAO.getCustomerByEmail(email);

        if (!customer || !customer.password_hash || customer.is_active === 0) {
            throw new Error('Invalid email or password');
        }
        
        // 密码比对
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
    // SSR / API 校验客户 token (用于中间件 requireCustomerAuth)
    // =====================================================
    static verifyAccess(token) {
        // 使用 verifyAccessToken，而不是 verifyRefreshToken
        return verifyAccessToken(token); 
    }
}

export default CustomerAuthService;