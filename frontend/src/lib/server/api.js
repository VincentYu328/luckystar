// src/lib/server/api.js
import { SERVER_API_URL } from '$env/static/private';

function buildCookieHeader(cookies) {
    if (!cookies) return null;
    const pairs = cookies.getAll().map(({ name, value }) => `${name}=${value}`);
    return pairs.length ? pairs.join('; ') : null;
}

async function request(fetch, cookies, method, path, data, extraHeaders = {}) {
    const headers = { ...extraHeaders };
    const cookieHeader = buildCookieHeader(cookies);
    if (cookieHeader) headers.cookie = cookieHeader;
    if (data && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${SERVER_API_URL}${path}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
    });

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

export const api = {
    products: {
        list(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', '/api/products'); },
        get(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/products/${id}`); },
        listCategories(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', '/api/products/categories'); },
        images(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/products/${id}/images`); },
        stock(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/products/${id}/stock`); },
        create(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', '/api/products', data); },
        update(ctx, id, data) { return request(ctx.fetch, ctx.cookies, 'PUT', `/api/products/${id}`, data); },
        delete(ctx, id) { return request(ctx.fetch, ctx.cookies, 'DELETE', `/api/products/${id}`); },
        addImage(ctx, id, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/products/${id}/images`, data); },
        updateImage(ctx, imageId, data) { return request(ctx.fetch, ctx.cookies, 'PUT', `/api/products/images/${imageId}`, data); },
        deleteImage(ctx, imageId) { return request(ctx.fetch, ctx.cookies, 'DELETE', `/api/products/images/${imageId}`); }
    },
    

    inventory: {
        fabricList(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/inventory/fabric`); },
        fabricIn(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/inventory/in`, data); },
        fabricOut(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/inventory/out`, data); },
        adjust(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/inventory/adjust`, data); },
        transactions(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/inventory/transactions`); }
    },

    retailOrders: {
        list(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/retail-orders`); },
        pending(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/retail-orders/pending`); },
        get(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/retail-orders/${id}`); },
        create(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/retail-orders`, data); },
        confirm(ctx, id) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/retail-orders/${id}/confirm`); },
        complete(ctx, id) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/retail-orders/${id}/complete`); }
    },

    customerAuth: {
        register(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/customer-auth/register`, data); },
        login(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/customer-auth/login`, data); },
        refresh(ctx) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/customer-auth/refresh`); },
        logout(ctx) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/customer-auth/logout`); },
        me(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/customer-auth/me`); }
    },

    staffAuth: {
        login(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/auth/login`, data); },
        logout(ctx) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/auth/logout`); }
    },

    my: {
        profile(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/my/profile`); },
        orders(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/my/orders`); },
        order(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/my/orders/${id}`); },
        measurements(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/my/measurements`); }
    },

    customers: {
        list(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/customers`); },
        get(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/customers/${id}`); },
        create(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/customers`, data); },
        update(ctx, id, data) { return request(ctx.fetch, ctx.cookies, 'PUT', `/api/customers/${id}`, data); },
        delete(ctx, id) { return request(ctx.fetch, ctx.cookies, 'DELETE', `/api/customers/${id}`); },
        groupOrders(ctx, customerId) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/customers/${customerId}/group-orders`); },
        groupOrder(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/group-orders/${id}`); },
        createGroupOrder(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/group-orders`, data); },
        updateGroupOrder(ctx, id, data) { return request(ctx.fetch, ctx.cookies, 'PUT', `/api/group-orders/${id}`, data); },
        deleteGroupOrder(ctx, id) { return request(ctx.fetch, ctx.cookies, 'DELETE', `/api/group-orders/${id}`); },
        groupMembers(ctx, orderId) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/group-orders/${orderId}/members`); },
        createGroupMember(ctx, orderId, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/group-orders/${orderId}/members`, data); },
        updateGroupMember(ctx, id, data) { return request(ctx.fetch, ctx.cookies, 'PUT', `/api/group-members/${id}`, data); },
        deleteGroupMember(ctx, id) { return request(ctx.fetch, ctx.cookies, 'DELETE', `/api/group-members/${id}`); }
    },

    measurements: {
        list(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/measurements`); },
        get(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/measurements/${id}`); },
        create(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/measurements`, data); },
        byCustomer(ctx, customerId) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/customers/${customerId}/measurements`); }
    },

    payments: {
        get(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/payments/id/${id}`); },
        byOrder(ctx, orderType, orderId) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/payments/${orderType}/${orderId}`); },
        create(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/payments`, data); },
        verify(ctx, id) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/payments/${id}/verify`); }
    },

    sizeCharts: {
        list(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/sizecharts`); },
        get(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/sizecharts/${id}`); },
        create(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/sizecharts`, data); },
        update(ctx, id, data) { return request(ctx.fetch, ctx.cookies, 'PUT', `/api/sizecharts/${id}`, data); },
        delete(ctx, id) { return request(ctx.fetch, ctx.cookies, 'DELETE', `/api/sizecharts/${id}`); },
        items: {
            list(ctx, chartId) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/sizecharts/${chartId}/items`); },
            get(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/sizechart-items/${id}`); },
            create(ctx, chartId, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/sizecharts/${chartId}/items`, data); },
            update(ctx, id, data) { return request(ctx.fetch, ctx.cookies, 'PUT', `/api/sizechart-items/${id}`, data); },
            delete(ctx, id) { return request(ctx.fetch, ctx.cookies, 'DELETE', `/api/sizechart-items/${id}`); }
        }
    },

    users: {
        list(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/users`); },
        get(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/users/${id}`); },
        create(ctx, data) { return request(ctx.fetch, ctx.cookies, 'POST', `/api/users`, data); },
        update(ctx, id, data) { return request(ctx.fetch, ctx.cookies, 'PATCH', `/api/users/${id}`, data); },
        activate(ctx, id) { return request(ctx.fetch, ctx.cookies, 'PATCH', `/api/users/${id}/activate`); },
        deactivate(ctx, id) { return request(ctx.fetch, ctx.cookies, 'PATCH', `/api/users/${id}/deactivate`); },
        resetPassword(ctx, id, newPassword) { return request(ctx.fetch, ctx.cookies, 'PATCH', `/api/users/${id}/reset-password`, { newPassword }); },
        permissions(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/users/${id}/permissions`); }
    },

    audit: {
        list(ctx) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/audit`); },
        get(ctx, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/audit/${id}`); },
        byUser(ctx, userId) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/audit?user=${userId}`); },
        byAction(ctx, action) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/audit?action=${action}`); },
        byTarget(ctx, type, id) { return request(ctx.fetch, ctx.cookies, 'GET', `/api/audit?target_type=${type}&target_id=${id}`); }
    }
};

console.log('[api products listCategories]', api.products?.listCategories);