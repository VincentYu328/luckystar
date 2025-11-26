// src/lib/server/db.js
//
// ⭐ SSR 内部服务端使用的 API fetch 封装
//    - 运行于服务器端（SvelteKit SSR）
//    - 仅用 SERVER_API_URL
//    - 不暴露给浏览器
//

import { error } from '@sveltejs/kit';

// SSR 专用后端地址（本地 3000 / 生产 3000）
const API_BASE = process.env.SERVER_API_URL || 'http://localhost:3000';

/**
 * SSR 内部调用后端 API
 */
export async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    let data;
    try {
        data = await res.json();
    } catch {
        throw error(500, `Invalid JSON from backend: ${API_BASE}${path}`);
    }

    if (!res.ok) {
        throw error(res.status, data?.error || 'API request failed');
    }

    return data;
}

export const apiGet = (path) => apiFetch(path, { method: 'GET' });
export const apiPost = (path, body) =>
    apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = (path, body) =>
    apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });
export const apiPatch = (path, body) =>
    apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) });
export const apiDelete = (path) =>
    apiFetch(path, { method: 'DELETE' });

export default {
    apiFetch,
    apiGet,
    apiPost,
    apiPut,
    apiPatch,
    apiDelete
};
