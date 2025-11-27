// src/lib/server/api.js
// ===============================
//  LuckyStar 全站通用 API 封装（2025）
//  - 无需 ctx.fetch / ctx.cookies
//  - 自动注入 event.fetch
//  - 自动 credentials: 'include'
//  - 自动处理 303/307 重定向
// ===============================

// 全局 fetch，由 hooks.server.js 注入
let globalFetch = null;

/**
 * 初始化 API 工具（必须在 hooks.server.js 调用）
 */
export function initApi(fetchImpl) {
    globalFetch = fetchImpl;
}

/**
 * 通用请求函数
 */
async function request(method, path, data = null, extraHeaders = {}) {
    if (!globalFetch) {
        throw new Error("API not initialized: 请在 hooks.server.js 中调用 initApi(event.fetch)");
    }

    const headers = {
        "content-type": "application/json",
        ...extraHeaders
    };

    const res = await globalFetch(`/api${path}`, {
        method,
        credentials: "include", // 自动带 cookie
        headers,
        body: data ? JSON.stringify(data) : undefined
    });

    // 自动处理 303/307（创建测量后跳转）
    if (res.status === 303 || res.status === 307 || res.redirected) {
        return res;
    }

    // JSON decode
    let payload;
    try {
        payload = await res.json();
    } catch {
        payload = { error: "Invalid JSON from backend" };
    }

    // 统一错误处理
    if (!res.ok) {
        console.error(`API ${method} ${path} failed`, payload);
        throw new Error(payload.error || payload.message || "API request failed");
    }

    return payload;
}

// ============================================
//  各业务模块（保持你原有结构，无 ctx）
// ============================================

export const api = {

    // ---------------- PRODUCTS ----------------
    products: {
        list() { return request("GET", "/products"); },
        get(id) { return request("GET", `/products/${id}`); },
        listCategories() { return request("GET", "/products/categories"); },
        images(id) { return request("GET", `/products/${id}/images`); },
        stock(id) { return request("GET", `/products/${id}/stock`); },
        create(data) { return request("POST", "/products", data); },
        update(id, data) { return request("PUT", `/products/${id}`, data); },
        delete(id) { return request("DELETE", `/products/${id}`); },
        addImage(id, data) { return request("POST", `/products/${id}/images`, data); },
        updateImage(imgId, data) { return request("PUT", `/products/images/${imgId}`, data); },
        deleteImage(imgId) { return request("DELETE", `/products/images/${imgId}`); }
    },

    // ---------------- INVENTORY ----------------
    inventory: {
        fabricList() { return request("GET", "/inventory/fabric"); },
        fabricIn(data) { return request("POST", "/inventory/in", data); },
        fabricOut(data) { return request("POST", "/inventory/out", data); },
        adjust(data) { return request("POST", "/inventory/adjust", data); },
        transactions() { return request("GET", "/inventory/transactions"); }
    },

    // ---------------- RETAIL ORDERS ----------------
    retailOrders: {
        list() { return request("GET", "/retail-orders"); },
        pending() { return request("GET", "/retail-orders/pending"); },
        get(id) { return request("GET", `/retail-orders/${id}`); },
        create(data) { return request("POST", "/retail-orders", data); },
        confirm(id) { return request("POST", `/retail-orders/${id}/confirm`); },
        complete(id) { return request("POST", `/retail-orders/${id}/complete`); }
    },

    // ---------------- CUSTOMER AUTH ----------------
    customerAuth: {
        register(data) { return request("POST", "/customer-auth/register", data); },
        login(data) { return request("POST", "/customer-auth/login", data); },
        refresh() { return request("POST", "/customer-auth/refresh"); },
        logout() { return request("POST", "/customer-auth/logout"); },
        me() { return request("GET", "/customer-auth/me"); }
    },

    // ---------------- STAFF AUTH ----------------
    staffAuth: {
        login(data) { return request("POST", "/auth/login", data); },
        logout() { return request("POST", "/auth/logout"); }
    },

    // ---------------- MY ----------------
    my: {
        profile() { return request("GET", "/my/profile"); },
        orders() { return request("GET", "/my/orders"); },
        order(id) { return request("GET", `/my/orders/${id}`); },
        measurements() { return request("GET", "/my/measurements"); }
    },

    // ---------------- CUSTOMERS ----------------
    customers: {
        list() { return request("GET", "/customers"); },
        get(id) { return request("GET", `/customers/${id}`); },
        create(data) { return request("POST", "/customers", data); },
        update(id, data) { return request("PUT", `/customers/${id}`, data); },
        delete(id) { return request("DELETE", `/customers/${id}`); },
        groupOrders(id) { return request("GET", `/customers/${id}/group-orders`); },
        groupOrder(id) { return request("GET", `/group-orders/${id}`); },
        createGroupOrder(data) { return request("POST", "/group-orders", data); },
        updateGroupOrder(id, data) { return request("PUT", `/group-orders/${id}`, data); },
        deleteGroupOrder(id) { return request("DELETE", `/group-orders/${id}`); },
        groupMembers(orderId) { return request("GET", `/group-orders/${orderId}/members`); },
        createGroupMember(orderId, data) { return request("POST", `/group-orders/${orderId}/members`, data); },
        updateGroupMember(id, data) { return request("PUT", `/group-members/${id}`, data); },
        deleteGroupMember(id) { return request("DELETE", `/group-members/${id}`); }
    },

    // ---------------- CUSTOMER ORDERS ----------------
    customerOrders: {
        create(data) { return request("POST", "/customers/me/orders", data); }
    },

    // ---------------- MEASUREMENTS ----------------
    measurements: {
        // ================================
        // Admin — 全部量体记录列表（方案 A）
        // GET /api/measurements
        // ================================
        list() {
            return request("GET", "/measurements");
        },

        // ================================
        // Admin — 获取单条 Measurement
        // GET /api/measurements/:id
        // ================================
        get(id) {
            return request("GET", `/measurements/${id}`);
        },

        // ================================
        // Customer — 某客户的量体记录
        // GET /api/customers/:id/measurements
        // ================================
        byCustomer(id) {
            return request("GET", `/customers/${id}/measurements`);
        },

        // ================================
        // Group Member — 某团体成员量体记录
        // GET /api/group-members/:id/measurements
        // ================================
        byGroupMember(id) {
            return request("GET", `/group-members/${id}/measurements`);
        },

        // ================================
        // 创建 Measurement：属于某客户
        // POST /api/customers/:id/measurements
        // ================================
        createForCustomer(id, data) {
            return request("POST", `/customers/${id}/measurements`, data);
        },

        // ================================
        // 创建 Measurement：属于某团体成员
        // POST /api/group-members/:id/measurements
        // ================================
        createForGroupMember(id, data) {
            return request("POST", `/group-members/${id}/measurements`, data);
        },

        // ================================
        // Admin — 更新 measurement
        // PUT /api/measurements/:id
        // ================================
        update(id, data) {
            return request("PUT", `/measurements/${id}`, data);
        },

        // ================================
        // Admin — 删除 measurement
        // DELETE /api/measurements/:id
        // ================================
        delete(id) {
            return request("DELETE", `/measurements/${id}`);
        }
    },

    // ---------------- PAYMENTS ----------------
    payments: {
        get(id) { return request("GET", `/payments/id/${id}`); },
        byOrder(type, id) { return request("GET", `/payments/${type}/${id}`); },
        create(data) { return request("POST", "/payments", data); },
        verify(id) { return request("POST", `/payments/${id}/verify`); }
    },

    // ---------------- SIZECHARTS ----------------
    sizeCharts: {
        list() { return request("GET", "/sizecharts"); },
        get(id) { return request("GET", `/sizecharts/${id}`); },
        create(data) { return request("POST", "/sizecharts", data); },
        update(id, data) { return request("PUT", `/sizecharts/${id}`, data); },
        delete(id) { return request("DELETE", `/sizecharts/${id}`); },
        items: {
            list(chartId) { return request("GET", `/sizecharts/${chartId}/items`); },
            get(id) { return request("GET", `/sizechart-items/${id}`); },
            create(chartId, data) { return request("POST", `/sizecharts/${chartId}/items`, data); },
            update(id, data) { return request("PUT", `/sizechart-items/${id}`, data); },
            delete(id) { return request("DELETE", `/sizechart-items/${id}`); }
        }
    },

    // ---------------- USERS ----------------
    users: {
        list() { return request("GET", "/users"); },
        get(id) { return request("GET", `/users/${id}`); },
        create(data) { return request("POST", "/users", data); },
        update(id, data) { return request("PATCH", `/users/${id}`, data); },
        activate(id) { return request("PATCH", `/users/${id}/activate`); },
        deactivate(id) { return request("PATCH", `/users/${id}/deactivate`); },
        resetPassword(id, newPassword) { return request("PATCH", `/users/${id}/reset-password`, { newPassword }); },
        permissions(id) { return request("GET", `/users/${id}/permissions`); }
    },

    // ---------------- AUDIT ----------------
    audit: {
        list() { return request("GET", "/audit"); },
        get(id) { return request("GET", `/audit/${id}`); },
        byUser(userId) { return request("GET", `/audit?user=${userId}`); },
        byAction(action) { return request("GET", `/audit?action=${action}`); },
        byTarget(type, id) { return request("GET", `/audit?target_type=${type}&target_id=${id}`); }
    }
};

// ---- 快捷 HTTP 方法（可选）----
api.get = (path) => request("GET", path);
api.post = (path, data) => request("POST", path, data);
api.put = (path, data) => request("PUT", path, data);
api.delete = (path) => request("DELETE", path);

// Debug:
console.log("[api] Loaded successfully");
