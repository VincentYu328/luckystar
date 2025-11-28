// frontend/src/routes/admin/audit/+page.server.js
import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export async function load({ locals, url }) {
    const user = locals.authUser;

    // 🔥 修复1：检查 staff 类型
    if (!user || user.type !== 'staff') {
        throw redirect(302, '/auth/login?redirect=/admin/audit');
    }

    // 🔥 修复2：只有 admin 可以查看审计日志
    if (user.role !== 'admin') {
        console.log(`[LOAD /admin/audit] Access denied: ${user.full_name} (role: ${user.role}) is not admin`);
        throw redirect(302, '/admin?error=forbidden');
    }

    try {
        const result = await api.audit.list();
        
        console.log("[LOAD /admin/audit] API result:", result);
        console.log("[LOAD /admin/audit] Logs count:", result?.logs?.length || 0);

        // 🔥 修复3：灵活处理返回格式
        const logs = Array.isArray(result) 
            ? result 
            : (result?.logs ?? result?.data ?? []);

        return { 
            logs,
            error: null
        };

    } catch (err) {
        console.error("[LOAD /admin/audit] Error:", err);
        
        return { 
            logs: [],
            error: err.message || 'Failed to load audit logs'
        };
    }
}