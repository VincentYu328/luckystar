// frontend/src/routes/admin/users/+page.server.js
import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export async function load({ locals, url }) {
    const user = locals.authUser;

    // 🔥 调试：打印当前用户信息
    console.log("[LOAD /admin/users] Current user:", {
        exists: !!user,
        type: user?.type,
        role: user?.role,
        full_name: user?.full_name
    });

    // 🔥 修复：放宽权限检查，允许所有 staff 访问
    // 如果您确实只想让 admin 访问，需要确认后端返回的 role 字段名称
    if (!user || user.type !== 'staff') {
        console.log("[LOAD /admin/users] Access denied: not staff");
        throw redirect(302, '/auth/login?redirect=/admin/users');
    }

    // 🔥 可选：如果必须是 admin，单独检查并给出提示
    if (user.role !== 'admin') {
        console.log("[LOAD /admin/users] Access denied: not admin, role is:", user.role);
        // 选项1：重定向到 403 页面或首页
        throw redirect(302, '/admin?error=forbidden');
        // 选项2：如果想让所有 staff 都能访问，删除这个检查
    }

    try {
        const result = await api.users.list();
        
        console.log("[LOAD /admin/users] API response:", {
            hasUsers: !!result?.users,
            count: result?.users?.length || 0,
            rawResult: result
        });

        // 从 URL 获取操作结果
        const createSuccess = url.searchParams.get('createSuccess') === 'true';
        const updateSuccess = url.searchParams.get('updateSuccess') === 'true';
        const deleteSuccess = url.searchParams.get('deleteSuccess') === 'true';
        const deleteError = url.searchParams.get('deleteError') || null;

        return { 
            users: result?.users ?? [],
            createSuccess,
            updateSuccess,
            deleteSuccess,
            deleteError
        };

    } catch (err) {
        console.error("[LOAD /admin/users] Error fetching users:", err);
        console.error("[LOAD /admin/users] Error stack:", err.stack);
        
        return { 
            users: [],
            createSuccess: false,
            updateSuccess: false,
            deleteSuccess: false,
            deleteError: err.message || 'Failed to load users'
        };
    }
}