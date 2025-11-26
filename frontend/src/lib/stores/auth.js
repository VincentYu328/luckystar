// frontend/src/lib/stores/auth.js
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// ------------------------------------------------------
// 全局登录状态（SSR 安全）
// ------------------------------------------------------

/**
 * SSR → user = null，isLoggedIn = null（未知）
 * CSR → fetchCurrentUser() 后才变为 true / false
 */
export const user = writable(null);
export const isLoggedIn = writable(null);
export const userType = derived(user, ($u) => $u?.type ?? null);

/**
 * 仅在浏览器端设置登录状态
 */
export function setUser(u) {
	user.set(u);

	if (browser) {
		isLoggedIn.set(!!u);
	}
}

// ------------------------------------------------------
// 安全 fetch（自动携带 Cookie）
// ------------------------------------------------------

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
	} catch {
		data = null;
	}

	return { res, data };
}

// ------------------------------------------------------
// 登录：支持 staff + customer
// ------------------------------------------------------

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
			return {
				success: false,
				error: data?.error || 'Login failed'
			};
		}

		// 登录成功后重新获取当前用户
		await fetchCurrentUser();

		return { success: true };
	} catch (err) {
		return { success: false, error: err.message };
	}
}

export function loginCustomer(email, password) {
	return login(email, password, { type: 'customer' });
}

export function loginStaff(email, password) {
	return login(email, password, { type: 'staff' });
}

// ------------------------------------------------------
// logout()：根据用户类型选择 API
// ------------------------------------------------------

export async function logout() {
	try {
		let currentUser;
		user.subscribe((u) => (currentUser = u))();

		if (currentUser?.type === 'customer') {
			await safeFetch('/api/customer-auth/logout', { method: 'POST' });
		} else if (currentUser?.type === 'staff') {
			await safeFetch('/api/auth/logout', { method: 'POST' });
		} else {
			// 不确定 → 两个都试（幂等）
			await safeFetch('/api/customer-auth/logout', { method: 'POST' });
			await safeFetch('/api/auth/logout', { method: 'POST' });
		}
	} catch (err) {
		console.error('Logout failed:', err);
	}

	// 清除状态
	user.set(null);
	if (browser) {
		isLoggedIn.set(false);
	}
}

// ------------------------------------------------------
// fetchCurrentUser()：顾客优先 → 员工其次
// ------------------------------------------------------

export async function fetchCurrentUser() {
	try {
		// 尝试顾客
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

		// 尝试员工
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

		// 都失败 → 未登录
		setUser(null);
	} catch (err) {
		console.error('fetchCurrentUser failed:', err);
		setUser(null);
	}
}

// ------------------------------------------------------
// 浏览器端自动保持登录状态
// SSR 不进行网络请求
// ------------------------------------------------------

if (browser) {
	fetchCurrentUser();
}
