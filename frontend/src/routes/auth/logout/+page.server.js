import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
    // 默认的 POST action，会被 <form method="POST"> 触发
    default: async ({ cookies }) => {
        // 1. 调用后端 API 清除 HTTP Only Cookie（如果需要）
        // 如果后端有 /api/auth/logout API，可以考虑在这里调用

        // 2. 清除 SvelteKit/前端设置的 Cookie
        cookies.delete('access_token', { 
            path: '/', 
            // 确保设置与 hooks.server.js 中设置 Access Token 时的属性一致
            // secure: true, // 生产环境启用
            // httpOnly: true, // 生产环境启用
        });

        cookies.delete('refresh_token', { 
            path: '/',
            // 确保设置与 hooks.server.js 中设置 Refresh Token 时的属性一致
        });
        
        // 3. 重定向到登录页面
        throw redirect(302, '/auth/login');
    }
};

// 注意：如果这个注销页面不需要加载任何数据，则不需要导出 load 函数。