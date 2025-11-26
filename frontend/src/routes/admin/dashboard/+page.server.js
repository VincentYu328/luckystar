import { redirect } from '@sveltejs/kit';
import { apiGet } from '$lib/server/api.js';

export async function load({ locals }) {
	const user = locals.authUser;

	// 再保险：后台必须是员工
	if (!user || user.type !== 'staff') {
		throw redirect(302, '/auth/login?redirect=/admin/dashboard');
	}

	// ⭐ 从后端读取仪表板统计（你未来在后端写即可）
	const stats = await apiGet('/admin/stats/dashboard');

	// 若暂未实现 API，提供兜底
	const safeStats = {
		today_orders: stats?.today_orders ?? 0,
		pending_orders: stats?.pending_orders ?? 0,
		total_products: stats?.total_products ?? 0,
		total_inventory_qty: stats?.total_inventory_qty ?? 0,
		today_sales: stats?.today_sales ?? 0
	};

	return {
		user,
		stats: safeStats
	};
}
