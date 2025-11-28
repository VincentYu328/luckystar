// src/lib/server/api.js
// ===============================
//  LuckyStar 全站通用 API 封装（2025）
//  统一处理：
//  • 自动注入 fetch（由 hooks.server.js 提供）
//  • 查询参数自动拼接（queryParams 对象 → ?k=v）
//  • 自动带 Cookie（credentials: "include"）
//  • 统一的 JSON 解析 + 错误处理
//  • 特殊状态码 303/307/redirected 直接返回响应（用于创建后跳转）
// ===============================

let globalFetch = null;

/**
 * 初始化 API 工具（必须在 hooks.server.js 中调用一次）
 * @param {typeof fetch} fetchImpl - 来自 event.fetch 的原生 fetch
 */
export function initApi(fetchImpl) {
    globalFetch = fetchImpl;
}

/**
 * 通用请求函数（内部核心）
 *
 * @param {'GET'|'POST'|'PUT'|'DELETE'|'PATCH'} method
 * @param {string} path
 * @param {object|null} [data=null]
 * @param {Record<string, string>} [extraHeaders={}]
 * @param {Record<string, string|number|boolean>} [queryParams={}]
 *
 * @returns {Promise<any>}
 */
async function request(method, path, data = null, extraHeaders = {}, queryParams = {}) {
    if (!globalFetch) {
        throw new Error('API not initialized: 请在 hooks.server.js 中调用 initApi(event.fetch)');
    }

    // 1. 拼接查询参数（自动处理 undefined / null / 布尔值）
    let fullPath = path;
    if (Object.keys(queryParams).length > 0) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        }
        const qs = params.toString();
        if (qs) fullPath += `?${qs}`;
    }

    // 2. 请求头
    const headers = {
        'content-type': 'application/json',
        ...extraHeaders,
    };

    // 3. 发起请求
    const res = await globalFetch(`/api${fullPath}`, {
        method,
        credentials: 'include', // 自动携带登录态 cookie
        headers,
        body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
    });

    // 4. 特殊重定向直接返回（用于创建测量后跳转等场景）
    if (res.status === 303 || res.status === 307 || res.redirected) {
        return res;
    }

    // 5. 解析 JSON（容错）
    let payload;
    try {
        payload = await res.json();
    } catch {
        payload = { error: 'Invalid JSON from backend' };
    }

    // 6. 统一错误处理
    if (!res.ok) {
        console.error(`API ${method} ${fullPath} ${res.status} failed:`, payload);
        const message = payload.error || payload.message || `HTTP ${res.status}`;
        throw new Error(message);
    }

    return payload;
}

// ============================================
//  对外暴露的统一 API 对象
// ============================================
export const api = {
    // ---- 基础 HTTP 方法 ----
    get(path, queryParams = {}, extraHeaders = {}) {
        return request('GET', path, null, extraHeaders, queryParams);
    },
    post(path, data = null, extraHeaders = {}) {
        return request('POST', path, data, extraHeaders);
    },
    put(path, data = null, extraHeaders = {}) {
        return request('PUT', path, data, extraHeaders);
    },
    patch(path, data = null, extraHeaders = {}) {
        return request('PATCH', path, data, extraHeaders);
    },
    del(path, extraHeaders = {}) {
        return request('DELETE', path, null, extraHeaders);
    },

    // ---------------- PRODUCTS ----------------
    products: {
        list() { return request('GET', '/products'); },
        get(id) { return request('GET', `/products/${id}`); },
        listCategories() { return request('GET', '/products/categories'); },
        images(id) { return request('GET', `/products/${id}/images`); },
        stock(id) { return request('GET', `/products/${id}/stock`); },
        create(data) { return request('POST', '/products', data); },
        update(id, data) { return request('PUT', `/products/${id}`, data); },
        delete(id) { return request('DELETE', `/products/${id}`); },
        addImage(id, data) { return request('POST', `/products/${id}/images`, data); },
        updateImage(imgId, data) { return request('PUT', `/products/images/${imgId}`, data); },
        deleteImage(imgId) { return request('DELETE', `/products/images/${imgId}`); },
    },

    // ---------------- INVENTORY ----------------
    inventory: {
        fabricList() { return request('GET', '/inventory/fabric'); },
        garmentList() { return request('GET', '/inventory/garments'); },
        transactions() { return request('GET', '/inventory/transactions'); },
        fabricIn(data) { return request('POST', '/inventory/in', data); },
        fabricOut(data) { return request('POST', '/inventory/out', data); },
        adjust(data) { return request('POST', '/inventory/adjust', data); },
    },

    // ---------------- RETAIL ORDERS ----------------
    retailOrders: {
        list() { return request('GET', '/retail-orders'); },
        pending() { return request('GET', '/retail-orders/pending'); },
        get(id) { return request('GET', `/retail-orders/${id}`); },
        create(data) { return request('POST', '/retail-orders', data); },
        confirm(id) { return request('POST', `/retail-orders/${id}/confirm`); },
        complete(id) { return request('POST', `/retail-orders/${id}/complete`); },
    },

    // ---------------- CUSTOMER AUTH ----------------
    customerAuth: {
        register(data) { return request('POST', '/customer-auth/register', data); },
        login(data) { return request('POST', '/customer-auth/login', data); },
        refresh() { return request('POST', '/customer-auth/refresh'); },
        logout() { return request('POST', '/customer-auth/logout'); },
        me() { return request('GET', '/customer-auth/me'); },
    },

    // ---------------- STAFF AUTH ----------------
    staffAuth: {
        login(data) { return request('POST', '/auth/login', data); },
        logout() { return request('POST', '/auth/logout'); },
    },

    // ---------------- MY ----------------
    my: {
        profile() { return request('GET', '/my/profile'); },
        orders() { return request('GET', '/my/orders'); },
        order(id) { return request('GET', `/my/orders/${id}`); },
        measurements() { return request('GET', '/my/measurements'); },
    },

    // ---------------- CUSTOMERS ----------------
    customers: {
        list(queryParams = {}) {
            return request('GET', '/customers', null, {}, queryParams);
        },
        get(id) { return request('GET', `/customers/${id}`); },
        create(data) { return request('POST', '/customers', data); },
        update(id, data) { return request('PUT', `/customers/${id}`, data); },
        delete(id) { return request('DELETE', `/customers/${id}`); },
        groupOrders(id) { return request('GET', `/customers/${id}/group-orders`); },
        groupOrder(id) { return request('GET', `/group-orders/${id}`); },
        createGroupOrder(data) { return request('POST', '/group-orders', data); },
        updateGroupOrder(id, data) { return request('PUT', `/group-orders/${id}`, data); },
        deleteGroupOrder(id) { return request('DELETE', `/group-orders/${id}`); },
        groupMembers(orderId) { return request('GET', `/group-orders/${orderId}/members`); },
        createGroupMember(orderId, data) { return request('POST', `/group-orders/${orderId}/members`, data); },
        updateGroupMember(id, data) { return request('PUT', `/group-members/${id}`, data); },
        deleteGroupMember(id) { return request('DELETE', `/group-members/${id}`); },
    },

    // ---------------- CUSTOMER ORDERS ----------------
    customerOrders: {
        create(data) { return request('POST', '/customers/me/orders', data); },
    },

    // ---------------- MEASUREMENTS ----------------
    measurements: {
        list() { return request('GET', '/measurements'); },
        get(id) { return request('GET', `/measurements/${id}`); },
        byCustomer(id) { return request('GET', `/customers/${id}/measurements`); },
        byGroupMember(id) { return request('GET', `/group-members/${id}/measurements`); },
        createForCustomer(id, data) { return request('POST', `/customers/${id}/measurements`, data); },
        createForGroupMember(id, data) { return request('POST', `/group-members/${id}/measurements`, data); },
        update(id, data) { return request('PUT', `/measurements/${id}`, data); },
        delete(id) { return request('DELETE', `/measurements/${id}`); },
    },

    // ---------------- PAYMENTS ----------------
    payments: {
        list() { return request('GET', '/payments'); }, // 🔥 添加这一行
        get(id) { return request('GET', `/payments/id/${id}`); },
        byOrder(type, id) { return request('GET', `/payments/${type}/${id}`); },
        create(data) { return request('POST', '/payments', data); },
        verify(id) { return request('POST', `/payments/${id}/verify`); },
        delete(id) { return request('DELETE', `/payments/${id}`); }, // 🔥 可选
    },

    // ---------------- SIZECHARTS ----------------
    sizeCharts: {
        list() { return request('GET', '/sizecharts'); },
        get(id) { return request('GET', `/sizecharts/${id}`); },
        create(data) { return request('POST', '/sizecharts', data); },
        update(id, data) { return request('PUT', `/sizecharts/${id}`, data); },
        delete(id) { return request('DELETE', `/sizecharts/${id}`); },
        items: {
            list(chartId) { return request('GET', `/sizecharts/${chartId}/items`); },
            get(id) { return request('GET', `/sizechart-items/${id}`); },
            create(chartId, data) { return request('POST', `/sizecharts/${chartId}/items`, data); },
            update(id, data) { return request('PUT', `/sizechart-items/${id}`, data); },
            delete(id) { return request('DELETE', `/sizechart-items/${id}`); },
        },
    },

    // ---------------- USERS ----------------
    users: {
        list() { return request('GET', '/users'); },
        get(id) { return request('GET', `/users/${id}`); },
        create(data) { return request('POST', '/users', data); },
        update(id, data) { return request('PATCH', `/users/${id}`, data); },
        activate(id) { return request('PATCH', `/users/${id}/activate`); },
        deactivate(id) { return request('PATCH', `/users/${id}/deactivate`); },
        resetPassword(id, newPassword) {
            return request('PATCH', `/users/${id}/reset-password`, { newPassword });
        },
        permissions(id) { return request('GET', `/users/${id}/permissions`); },
    },

    // ---------------- AUDIT ----------------
    audit: {
        list() { return request('GET', '/audit'); },
        get(id) { return request('GET', `/audit/${id}`); },
        byUser(userId) { return request('GET', '/audit', null, {}, { user: userId }); },
        byAction(action) { return request('GET', '/audit', null, {}, { action }); },
        byTarget(type, id) {
            return request('GET', '/audit', null, {}, { target_type: type, target_id: id });
        },
    },
};

// Debug 提示（仅在开发环境）
if (import.meta.env.DEV) {
    console.log('[api] LuckyStar API 工具已加载（2025 版）');
}