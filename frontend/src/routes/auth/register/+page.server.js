// frontend/src/routes/auth/register/+page.server.js
import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (locals.authUser) {
		// 顾客已登录 → 去 /my
		if (locals.authUser.type === 'customer') {
			throw redirect(302, '/my');
		}
		// 员工已登录 → 去 /admin
		else if (locals.authUser.type === 'staff') {
			throw redirect(302, '/admin');
		}
	}

	return {};
}
