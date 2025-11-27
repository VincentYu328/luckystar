// src/lib/stores/auth.js
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

/* ============================================================
   1. 全局状态
   ============================================================ */

export const user = writable(null);           // 用户对象或 null
export const isLoggedIn = writable(false);    // 永远 true / false，不再用 null
export const userType = derived(user, ($u) => $u?.type ?? null);

/**
 * 设置全局用户状态（统一入口）
 */
export function setUser(u) {
    user.set(u);
    if (browser) {
        isLoggedIn.set(!!u);
    }
}

/* ============================================================
   2. 安全 fetch（自动携带 Cookie）
   ============================================================ */
async function safeFetch(url, options = {}) {
    const res = await fetch(url, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    let data = null;
    try {
        data = await res.json();
    } catch (_) {}

    return { res, data };
}

/* ============================================================
   3. 登录（自动加载 profile）
   ============================================================ */

export async function login(email, password, options = {}) {
    const type = options.type || 'staff';

    try {
        const endpoint =
            type === 'customer'
                ? '/api/customer-auth/login'
                : '/api/auth/login';

        const { res, data } = await safeFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            return { success: false, error: data?.error || 'Login failed' };
        }

        // 登录成功 → 必须刷新用户信息
        await fetchCurrentUser();

        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export const loginCustomer = (email, pw) =>
    login(email, pw, { type: 'customer' });

export const loginStaff = (email, pw) =>
    login(email, pw, { type: 'staff' });

/* ============================================================
   4. Logout（自动清除状态 + 立即更新 Navbar）
   ============================================================ */

export async function logout() {
    let current;
    user.subscribe((v) => (current = v))(); // 一次性 snapshot

    try {
        if (current?.type === 'customer') {
            await safeFetch('/api/customer-auth/logout', { method: 'POST' });
        } else if (current?.type === 'staff') {
            await safeFetch('/api/auth/logout', { method: 'POST' });
        } else {
            // fallback 幂等写法
            await safeFetch('/api/customer-auth/logout', { method: 'POST' });
            await safeFetch('/api/auth/logout', { method: 'POST' });
        }
    } catch (err) {
        console.error('Logout failed:', err);
    }

    // ⭐⭐ 一次性清除，全局立即生效（UI 即时更新）
    setUser(null);
}

/* ============================================================
   5. 自动获取当前用户（customer > staff）
   ============================================================ */

export async function fetchCurrentUser() {
    try {
        // Customer 优先
        {
            const { res, data } = await safeFetch('/api/customer-auth/me');
            if (res.ok && data?.customer) {
                setUser({
                    ...data.customer,
                    type: 'customer'
                });
                return;
            }
        }

        // Staff 其次
        {
            const { res, data } = await safeFetch('/api/auth/me');
            if (res.ok && data?.user) {
                setUser({
                    ...data.user,
                    type: 'staff',
                    role: data.user.role || data.user.position || 'staff'
                });
                return;
            }
        }

        // 都没有
        setUser(null);
    } catch (err) {
        console.error('fetchCurrentUser failed:', err);
        setUser(null);
    }
}

/* ============================================================
   6. 浏览器端自动初始化
   ============================================================ */

if (browser) {
    fetchCurrentUser();
}
