import { redirect, error } from '@sveltejs/kit';

/**
 * 后台管理区访问控制
 * 适用范围：/admin/*
 *
 * locals.authUser 结构示例：
 * {
 *   id,
 *   full_name,
 *   email,
 *   role,   // 'admin' | 'manager' | 'sales'
 *   type    // 'staff' | 'customer'
 * }
 */

export function load({ locals, url }) {
	const user = locals.authUser;

	// 1) 未登录 → 跳转到登录页
	if (!user) {
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(302, `/auth/login?redirect=${redirectTo}`);
	}

	// 2) 顾客（前台用户）无权进入后台
	if (user.type !== 'staff') {
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(302, `/auth/login?redirect=${redirectTo}`);
	}

	// 3) 后台最基础 RBAC：仅 staff 角色
	const allowedRoles = ['admin', 'manager', 'sales'];
	if (user.role && !allowedRoles.includes(user.role)) {
		throw error(403, 'Permission denied: insufficient role privileges.');
	}

	// 4) 放行后台
	return {
		user
	};
}
