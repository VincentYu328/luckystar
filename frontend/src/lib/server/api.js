// ======================================================================
// 前端统一 API 封装（支持 STAFF + CUSTOMER 双体系）
// ======================================================================

// 关键修复：使用 SvelteKit PUBLIC_ 前缀环境变量
export const API_BASE = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3000';

// ======================================================================
// 基础请求函数（自动携带 Cookie）
// ======================================================================
async function request(method, path, data) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    };

    if (data) opts.body = JSON.stringify(data);

    const res = await fetch(`${API_BASE}${path}`, opts);

    let payload;
    try {
        payload = await res.json();
    } catch {
        payload = { error: 'Invalid JSON from server' };
    }

    if (!res.ok) {
        console.error(`API ${method} ${path} failed`, payload);
        throw new Error(payload.error || 'API request failed');
    }

    return payload;
}

// ======================================================================
// API 命名空间
// ======================================================================
export const api = {

    // ================================
    // PRODUCTS（产品）
    // ================================
    products: {
        list() { return request('GET', `/api/products`); },
        get(id) { return request('GET', `/api/products/${id}`); },
        images(id) { return request('GET', `/api/products/${id}/images`); },
        stock(id) { return request('GET', `/api/products/${id}/stock`); },

        uploadImage(productId, formData) {
            return fetch(`${API_BASE}/api/products/${productId}/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            }).then(r => r.json());
        }
    },

    // ================================
    // INVENTORY（布料库存）
    // ================================
    inventory: {
        fabricList() { return request('GET', `/api/inventory/fabric`); },
        fabricIn(data) { return request('POST', `/api/inventory/in`, data); },
        fabricOut(data) { return request('POST', `/api/inventory/out`, data); },
        adjust(data) { return request('POST', `/api/inventory/adjust`, data); },
        transactions() { return request('GET', `/api/inventory/transactions`); }
    },

    // ================================
    // RETAIL ORDERS（零售订单）
    // ================================
    retailOrders: {
        list() { return request('GET', `/api/retail-orders`); },
        pending() { return request('GET', `/api/retail-orders/pending`); },
        get(id) { return request('GET', `/api/retail-orders/${id}`); },
        create(data) { return request('POST', `/api/retail-orders`, data); },
        confirm(id) { return request('POST', `/api/retail-orders/${id}/confirm`); },
        complete(id) { return request('POST', `/api/retail-orders/${id}/complete`); }
    },

    // ==================================================================
    // CUSTOMER AUTH（客户登录）
    // ==================================================================
    customerAuth: {
        register(data) { return request('POST', `/api/customer-auth/register`, data); },
        login(data) { return request('POST', `/api/customer-auth/login`, data); },
        refresh() { return request('POST', `/api/customer-auth/refresh`); },
        logout() { return request('POST', `/api/customer-auth/logout`); },
        me() { return request('GET', `/api/customer-auth/me`); }
    },

    // ==================================================================
    // STAFF AUTH（后台员工登录）
    // ==================================================================
    staffAuth: {
        login(data) { return request('POST', `/api/auth/login`, data); },
        logout() { return request('POST', `/api/auth/logout`); }
    },

    // ==================================================================
    // MY（当前顾客中心）
    // ==================================================================
    my: {
        profile() { return request('GET', `/api/my/profile`); },
        orders() { return request('GET', `/api/my/orders`); },
        order(id) { return request('GET', `/api/my/orders/${id}`); },
        measurements() { return request('GET', `/api/my/measurements`); }
    },

    // ==================================================================
    // CUSTOMERS（后台客户管理 + 团体订单）
    // ==================================================================
    customers: {
        list() { return request('GET', `/api/customers`); },
        get(id) { return request('GET', `/api/customers/${id}`); },
        create(data) { return request('POST', `/api/customers`, data); },
        update(id, data) { return request('PUT', `/api/customers/${id}`, data); },
        delete(id) { return request('DELETE', `/api/customers/${id}`); },

        groupOrders(customerId) {
            return request('GET', `/api/customers/${customerId}/group-orders`);
        },
        groupOrder(id) {
            return request('GET', `/api/group-orders/${id}`);
        },
        createGroupOrder(data) {
            return request('POST', `/api/group-orders`, data);
        },
        updateGroupOrder(id, data) {
            return request('PUT', `/api/group-orders/${id}`, data);
        },
        deleteGroupOrder(id) {
            return request('DELETE', `/api/group-orders/${id}`);
        },

        groupMembers(orderId) {
            return request('GET', `/api/group-orders/${orderId}/members`);
        },
        createGroupMember(orderId, data) {
            return request('POST', `/api/group-orders/${orderId}/members`, data);
        },
        updateGroupMember(id, data) {
            return request('PUT', `/api/group-members/${id}`, data);
        },
        deleteGroupMember(id) {
            return request('DELETE', `/api/group-members/${id}`);
        }
    },

    // ==================================================================
    // MEASUREMENTS（量体）
    // ==================================================================
    measurements: {
        list() { return request('GET', `/api/measurements`); },
        get(id) { return request('GET', `/api/measurements/${id}`); },
        create(data) { return request('POST', `/api/measurements`, data); },
        byCustomer(customerId) {
            return request('GET', `/api/customers/${customerId}/measurements`);
        }
    },

    // ==================================================================
    // PAYMENTS（付款）
    // ==================================================================
    payments: {
        get(id) { return request('GET', `/api/payments/id/${id}`); },
        byOrder(orderType, orderId) {
            return request('GET', `/api/payments/${orderType}/${orderId}`);
        },
        create(data) {
            return request('POST', `/api/payments`, data);
        },
        verify(id) {
            return request('POST', `/api/payments/${id}/verify`);
        }
    },

    // ==================================================================
    // SIZE CHARTS（尺码表）
    // ==================================================================
    sizeCharts: {
        list() { return request('GET', `/api/sizecharts`); },
        get(id) { return request('GET', `/api/sizecharts/${id}`); },
        create(data) { return request('POST', `/api/sizecharts`, data); },
        update(id, data) { return request('PUT', `/api/sizecharts/${id}`, data); },
        delete(id) { return request('DELETE', `/api/sizecharts/${id}`); }
    },

    // ==================================================================
    // SIZE CHART ITEMS（尺码表字段）
    // ==================================================================
    sizeChartItems: {
        list(sizeChartId) {
            return request('GET', `/api/sizecharts/${sizeChartId}/items`);
        },
        get(id) {
            return request('GET', `/api/sizechart-items/${id}`);
        },
        create(sizeChartId, data) {
            return request('POST', `/api/sizecharts/${sizeChartId}/items`, data);
        },
        update(id, data) {
            return request('PUT', `/api/sizechart-items/${id}`, data);
        },
        delete(id) {
            return request('DELETE', `/api/sizechart-items/${id}`);
        }
    },

    // ==================================================================
    // STAFF USERS（后台内部员工）
    // ==================================================================
    users: {
        list() { return request('GET', `/api/users`); },
        get(id) { return request('GET', `/api/users/${id}`); },
        create(data) { return request('POST', `/api/users`, data); },
        update(id, data) { return request('PATCH', `/api/users/${id}`, data); },

        activate(id) { return request('PATCH', `/api/users/${id}/activate`); },
        deactivate(id) { return request('PATCH', `/api/users/${id}/deactivate`); },
        resetPassword(id, newPassword) {
            return request('PATCH', `/api/users/${id}/reset-password`, { newPassword });
        },

        permissions(id) {
            return request('GET', `/api/users/${id}/permissions`);
        }
    },

    // ==================================================================
    // AUDIT LOGS（审计日志）
    // ==================================================================
    audit: {
        list() {
            return request('GET', `/api/audit`);
        },
        get(id) {
            return request('GET', `/api/audit/${id}`);
        },
        byUser(userId) {
            return request('GET', `/api/audit?user=${userId}`);
        },
        byAction(action) {
            return request('GET', `/api/audit?action=${action}`);
        },
        byTarget(type, id) {
            return request('GET', `/api/audit?target_type=${type}&target_id=${id}`);
        }
    }
};
