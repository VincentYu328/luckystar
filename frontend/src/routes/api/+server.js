// src/routes/api/+server.js
// 统一提供给前端的 API Base 配置

import { json } from '@sveltejs/kit';

// 来自 SvelteKit 环境变量体系
// PUBLIC_ 开头：浏览器可读
// 非 PUBLIC_：仅 SSR 使用
// ----------------------------------------------------

import {
    PUBLIC_BACKEND_URL,
    PUBLIC_SITE_URL
} from '$env/static/public';

import {
    SERVER_API_URL
} from '$env/static/private';

/**
 * 返回给前端（浏览器 & SSR）：
 * - 前端 fetch 用的 BASE URL（PUBLIC_BACKEND_URL）
 * - SSR fetch 用的 BASE URL（SERVER_API_URL）
 */
export function GET() {
    return json({
        status: 'ok',

        // 浏览器访问后端时使用
        public_api: PUBLIC_BACKEND_URL,

        // SSR 内部 fetch 使用 —— 浏览器端无法看到（安全的）
        server_api: SERVER_API_URL,

        // 网站信息（可选）
        site_url: PUBLIC_SITE_URL
    });
}
