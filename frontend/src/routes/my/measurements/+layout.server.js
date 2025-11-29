// frontend\src\routes\my\measurements\+layout.server.js

import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api'; 

/**
 * 使用 +layout.server.js 而不是 +page.server.js
 * 优势：加载的数据可以被子路由 (如 /edit) 通过 await parent() 继承使用
 */
export async function load({ locals, url, fetch, cookies }) {
    const user = locals.authUser;

    if (!user || user.type !== 'customer') {
        const redirectTo = encodeURIComponent(url.pathname + url.search);
        throw redirect(302, `/auth/login?redirect=${redirectTo}`);
    }

    let measurement = null;

    try {
        const data = await api.my.measurements({ fetch, cookies });
        
        console.log('🔍 [Frontend Layout] Received from backend:', data);
        
        // ✅ 简化处理：后端现在直接返回对象或 null
        if (data && (data.id || data.height)) {
            measurement = data;
        } else {
            measurement = null;
        }

    } catch (error) {
        console.error("❌ Error fetching measurements:", error);
        measurement = null; 
    }

    return {
        user,
        measurements: measurement 
    };
}