// frontend/src/routes/admin/users/+page.server.js
import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export async function load({ locals, url }) {
    const user = locals.authUser;

    // 基本权限检查：必须是 staff
    if (!user || user.type !== 'staff') {
        throw redirect(302, '/auth/login?redirect=/admin/users');
    }

    // 🔥 使用 role 字段检查（现在应该有值了）
    if (user.role !== 'admin') {
        console.log(`[LOAD /admin/users] Access denied: ${user.full_name} (role: ${user.role}) is not admin`);
        throw redirect(302, '/admin?error=forbidden');
    }

    try {
        const result = await api.users.list();
        
        console.log("[LOAD /admin/users] fetched users:", result?.users ? result.users.length : 0);

        return { 
            users: result?.users ?? [],
            createSuccess: url.searchParams.get('createSuccess') === 'true',
            updateSuccess: url.searchParams.get('updateSuccess') === 'true',
            deleteSuccess: url.searchParams.get('deleteSuccess') === 'true',
            deleteError: url.searchParams.get('deleteError') || null
        };

    } catch (err) {
        console.error("[LOAD /admin/users] Error:", err);
        
        return { 
            users: [],
            createSuccess: false,
            updateSuccess: false,
            deleteSuccess: false,
            deleteError: err.message || 'Failed to load users'
        };
    }
}