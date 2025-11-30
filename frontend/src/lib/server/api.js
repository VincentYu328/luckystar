// ===============================
//  LuckyStar 全站通用 API 封装（2025）
// ===============================

// ... (requestWithContext, request, BASE_URL, globalFetch, initApi 函数保持不变)

async function requestWithContext(method, path, data = null, extraHeaders = {}, queryParams = {}, context = null) {
    const fetchToUse = context?.fetch || globalFetch;

    if (!fetchToUse) {
        throw new Error('API not initialized: 请在 hooks.server.js 中调用 initApi(event.fetch)');
    }

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

    const headers = {
        'content-type': 'application/json',
        ...extraHeaders,
    };

    // ⭐ 关键：如果有 context.cookies，添加到请求头
    if (context?.cookies) {
        const cookieHeader = context.cookies.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ');
        if (cookieHeader) {
            headers['cookie'] = cookieHeader;
        }
    }

    const url = `${BASE_URL}${fullPath}`;

    const res = await fetchToUse(url, {
        method,
        credentials: 'include',
        headers,
        body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
    });

    if (res.status === 303 || res.status === 307 || res.redirected) {
        return res;
    }

    let payload;
    try {
        payload = await res.json();
    } catch {
        payload = { error: 'Invalid JSON from backend' };
    }

    if (!res.ok) {
        console.error(`API ${method} ${fullPath} ${res.status} failed:`, payload);
        const message = payload.error || payload.message || `HTTP ${res.status}`;
        throw new Error(message);
    }

    return payload;
}


import { PUBLIC_API_URL } from '$env/static/public';

// 拼接完整的后端 API 地址
const BASE_URL = `${PUBLIC_API_URL}/api`;

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
 */
async function request(method, path, data = null, extraHeaders = {}, queryParams = {}) {
    if (!globalFetch) {
        throw new Error('API not initialized: 请在 hooks.server.js 中调用 initApi(event.fetch)');
    }

    // 1. 拼接查询参数
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
    const url = `${BASE_URL}${fullPath}`;

    const res = await globalFetch(url, {
        method,
        credentials: 'include', // 自动携带登录态 cookie
        headers,
        body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
    });

    // 4. 特殊重定向直接返回（用于创建后跳转等场景）
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
//  对外暴露的统一 API 对象
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
        list(context = null) {
            return context
                ? requestWithContext('GET', '/products', null, {}, {}, context)
                : request('GET', '/products');
        },
        get(id, context = null) {
            return context
                ? requestWithContext('GET', `/products/${id}`, null, {}, {}, context)
                : request('GET', `/products/${id}`);
        },
        listCategories(context = null) {
            return context
                ? requestWithContext('GET', '/products/categories', null, {}, {}, context)
                : request('GET', '/products/categories');
        },
        images(id, context = null) {
            return context
                ? requestWithContext('GET', `/products/${id}/images`, null, {}, {}, context)
                : request('GET', `/products/${id}/images`);
        },
        create(data, context = null) {
            return context
                ? requestWithContext('POST', '/products', data, {}, {}, context)
                : request('POST', '/products', data);
        },
        update(id, data, context = null) {
            return context
                ? requestWithContext('PUT', `/products/${id}`, data, {}, {}, context)
                : request('PUT', `/products/${id}`, data);
        },
        delete(id, context = null) {
            return context
                ? requestWithContext('DELETE', `/products/${id}`, null, {}, {}, context)
                : request('DELETE', `/products/${id}`);
        },
        addImage(id, data, context = null) {
            return context
                ? requestWithContext('POST', `/products/${id}/images`, data, {}, {}, context)
                : request('POST', `/products/${id}/images`, data);
        },
        updateImage(imgId, data, context = null) {
            return context
                ? requestWithContext('PUT', `/products/images/${imgId}`, data, {}, {}, context)
                : request('PUT', `/products/images/${imgId}`, data);
        },
        deleteImage(imgId, context = null) {
            return context
                ? requestWithContext('DELETE', `/products/images/${imgId}`, null, {}, {}, context)
                : request('DELETE', `/products/images/${imgId}`);
        },

        // ⭐ 新增：成衣入库批次 (对应 POST /products/garment/incoming)
        recordGarmentIncoming(data, context = null) {
            return context
                ? requestWithContext('POST', '/products/garment/incoming', data, {}, {}, context)
                : request('POST', '/products/garment/incoming', data);
        },

        // ⭐ 新增：创建唯一项/条码 (对应 POST /products/inventory/item)
        createUniqueItem(data, context = null) {
            return context
                ? requestWithContext('POST', '/products/inventory/item', data, {}, {}, context)
                : request('POST', '/products/inventory/item', data);
        },

        // ⭐ 新增：通过条码查询唯一项 (对应 GET /products/inventory/item/:uniqueCode)
        getUniqueItemByCode(uniqueCode, context = null) {
            return context
                ? requestWithContext('GET', `/products/inventory/item/${uniqueCode}`, null, {}, {}, context)
                : request('GET', `/products/inventory/item/${uniqueCode}`);
        },
    },

    // ---------------- INVENTORY ----------------
    inventory: {
        // 库存列表查询 (GET)
        fabricList() {
            return request('GET', '/products/fabric/stock');
        },
        garmentList() {
            return request('GET', '/products/garment/stock');
        },

        // 布料操作 (POST) —— 统一加上类型防御
        fabricIn(payload) {
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
                throw new Error('api.inventory.fabricIn() 参数必须是对象，例如 { fabricId: 12, quantity: 50, unit: "m" }');
            }
            return request('POST', '/products/fabric/incoming', payload);
        },

        fabricUsage(payload) {
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
                throw new Error('api.inventory.fabricUsage() 参数必须是对象，例如 { fabricId: 12, quantity: 3.5, garmentId: 88 }');
            }
            return request('POST', '/products/fabric/usage', payload);
        },

        /**
         * 成衣销售 / 出库
         * 只要传入对象就不会再出现 “Unexpected token '1'” 错误
         */
        garmentSale(payload) {
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
                throw new Error(
                    'api.inventory.garmentSale() 参数必须是对象！\n' +
                    '正确示例：\n' +
                    '  { garmentId: 123, quantity: 1 }\n' +
                    '  或 { uniqueCode: "GC20250123", customerId: 99, remark: "零售" }'
                );
            }
            return request('POST', '/products/garment/sale', payload);
        },

        // 通用库存调整（手动改库存、报损、盘点等）
        adjust(payload) {
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
                throw new Error('api.inventory.adjust() 参数必须是对象，例如 { garmentId: 123, diff: -1, reason: "报损" }');
            }
            return request('POST', '/inventory/adjust', payload);
        },

        // 交易/出入库记录
        transactions() {
            return request('GET', '/inventory/transactions');
        },
    },

    // ---------------- RETAIL ORDERS ----------------
    retailOrders: {
        list() { return request('GET', '/retail-orders'); },
        pending() { return request('GET', '/retail-orders/pending'); },
        get(id) { return request('GET', `/retail-orders/${id}`); },
        create(data) { return request('POST', '/retail-orders', data); },

        // ⭐ 新增: 通用更新订单信息 (对应 PUT 请求)
        update(id, data) {
            return request('PUT', `/retail-orders/${id}`, data);
        },

        // ⭐ 新增: 删除订单 (对应 DELETE 请求)
        delete(id) {
            return request('DELETE', `/retail-orders/${id}`);
        },

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

    // ---------------- MY（客户自己）----------------
    my: {
        profile() { return request('GET', '/customers/me/profile'); },
        orders() { return request('GET', '/customers/me/orders'); },
        order(id) { return request('GET', `/customers/me/orders/${id}`); },

        measurements(context = null) {
            return context
                ? requestWithContext('GET', '/customers/me/measurements', null, {}, {}, context)
                : request('GET', '/customers/me/measurements');
        },

        saveMeasurements(data, context = null) {
            return context
                ? requestWithContext('PUT', '/customers/me/measurements', data, {}, {}, context)
                : request('PUT', '/customers/me/measurements', data);
        },
    },


    // ---------------- GROUP ORDERS ----------------
    groupOrders: {
        list(context = null) {
            return context
                ? requestWithContext('GET', '/customers/group-orders', null, {}, {}, context)
                : request('GET', '/customers/group-orders');
        },
        get(id, context = null) {
            return context
                ? requestWithContext('GET', `/customers/group-orders/${id}`, null, {}, {}, context)
                : request('GET', `/customers/group-orders/${id}`);
        },
        create(data, context = null) {
            return context
                ? requestWithContext('POST', '/customers/group-orders', data, {}, {}, context)
                : request('POST', '/customers/group-orders', data);
        },
        update(id, data, context = null) {
            return context
                ? requestWithContext('PUT', `/customers/group-orders/${id}`, data, {}, {}, context)
                : request('PUT', `/customers/group-orders/${id}`, data);
        },
        delete(id, context = null) {
            return context
                ? requestWithContext('DELETE', `/customers/group-orders/${id}`, null, {}, {}, context)
                : request('DELETE', `/customers/group-orders/${id}`);
        },
        members(orderId, context = null) {
            return context
                ? requestWithContext('GET', `/customers/group-orders/${orderId}/members`, null, {}, {}, context)
                : request('GET', `/customers/group-orders/${orderId}/members`);
        },
        addMember(orderId, data, context = null) {
            return context
                ? requestWithContext('POST', `/customers/group-orders/${orderId}/members`, data, {}, {}, context)
                : request('POST', `/customers/group-orders/${orderId}/members`, data);
        },
        updateMember(memberId, data, context = null) {
            return context
                ? requestWithContext('PUT', `/customers/group-members/${memberId}`, data, {}, {}, context)
                : request('PUT', `/customers/group-members/${memberId}`, data);
        },
        deleteMember(memberId, context = null) {
            return context
                ? requestWithContext('DELETE', `/customers/group-members/${memberId}`, null, {}, {}, context)
                : request('DELETE', `/customers/group-members/${memberId}`);
        },
    },

    // ---------------- CUSTOMERS ----------------
    customers: {
        list(queryParams = {}, context = null) {
            return context
                ? requestWithContext('GET', '/customers', null, {}, queryParams, context)
                : request('GET', '/customers', null, {}, queryParams);
        },
        get(id, context = null) {
            return context
                ? requestWithContext('GET', `/customers/${id}`, null, {}, {}, context)
                : request('GET', `/customers/${id}`);
        },
        create(data, context = null) {
            return context
                ? requestWithContext('POST', '/customers', data, {}, {}, context)
                : request('POST', '/customers', data);
        },
        update(id, data, context = null) {
            return context
                ? requestWithContext('PUT', `/customers/${id}`, data, {}, {}, context)
                : request('PUT', `/customers/${id}`, data);
        },
        delete(id, context = null) {
            return context
                ? requestWithContext('DELETE', `/customers/${id}`, null, {}, {}, context)
                : request('DELETE', `/customers/${id}`);
        },
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
        list(context = null) {
            return context
                ? requestWithContext('GET', '/measurements', null, {}, {}, context)
                : request('GET', '/measurements');
        },
        get(id, context = null) {
            return context
                ? requestWithContext('GET', `/measurements/${id}`, null, {}, {}, context)
                : request('GET', `/measurements/${id}`);
        },
        byCustomer(id, context = null) {
            return context
                ? requestWithContext('GET', `/customers/${id}/measurements`, null, {}, {}, context)
                : request('GET', `/customers/${id}/measurements`);
        },
        byGroupMember(id, context = null) {
            return context
                ? requestWithContext('GET', `/group-members/${id}/measurements`, null, {}, {}, context)
                : request('GET', `/group-members/${id}/measurements`);
        },
        getByGroupMember(memberId, context = null) {
            return context
                ? requestWithContext('GET', `/measurements/group-member/${memberId}`, null, {}, {}, context)
                : request('GET', `/measurements/group-member/${memberId}`);
        },
        createForCustomer(id, data, context = null) {
            return context
                ? requestWithContext('POST', `/customers/${id}/measurements`, data, {}, {}, context)
                : request('POST', `/customers/${id}/measurements`, data);
        },
        createForGroupMember(id, data, context = null) {
            return context
                ? requestWithContext('POST', `/group-members/${id}/measurements`, data, {}, {}, context)
                : request('POST', `/group-members/${id}/measurements`, data);
        },
        saveForGroupMember(memberId, data, context = null) {
            return context
                ? requestWithContext('POST', `/measurements/group-member/${memberId}`, data, {}, {}, context)
                : request('POST', `/measurements/group-member/${memberId}`, data);
        },
        update(id, data, context = null) {
            return context
                ? requestWithContext('PUT', `/measurements/${id}`, data, {}, {}, context)
                : request('PUT', `/measurements/${id}`, data);
        },
        delete(id, context = null) {
            return context
                ? requestWithContext('DELETE', `/measurements/${id}`, null, {}, {}, context)
                : request('DELETE', `/measurements/${id}`);
        },
    },

    // ---------------- PAYMENTS ----------------
    payments: {
        list() { return request('GET', '/payments'); },
        get(id) { return request('GET', `/payments/id/${id}`); }, // 注意这里是 /id/ 而不是直接 ${id}
        byOrder(type, id) { return request('GET', `/payments/${type}/${id}`); },
        create(data) { return request('POST', '/payments', data); },
        verify(id) { return request('POST', `/payments/${id}/verify`); },
        delete(id) { return request('DELETE', `/payments/${id}`); },
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
        list() { return request('GET', '/audits'); },
        get(id) { return request('GET', `/audits/${id}`); },
        byUser(userId) { return request('GET', '/audits', null, {}, { user: userId }); },
        byAction(action) { return request('GET', '/audits', null, {}, { action }); },
        byTarget(type, id) {
            return request('GET', '/audits', null, {}, { target_type: type, target_id: id });
        },
    },
};

// Debug 提示（仅在开发环境）
if (import.meta.env.DEV) {
    console.log('[api] LuckyStar API 工具已加载（2025 版）');
}