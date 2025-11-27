// frontend/src/routes/admin/measurements/[id]/+page.server.js

import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

/* =====================================================================
 * LOAD
 * ===================================================================== */
export async function load({ locals, params }) {

    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const measurementId = Number(params.id);
    if (!measurementId) {
        throw error(400, "Invalid measurement ID");
    }

    // ---- 获取 measurement ----
    const raw = await api.measurements.get(measurementId);
    const measurement = raw?.measurement ?? raw;

    if (!measurement || !measurement.id) {
        throw error(404, "Measurement not found");
    }
    if (!measurement.customer_id) {
        throw error(500, "Measurement missing customer_id");
    }

    // ---- 获取客户 ----
    const customerRes = await api.customers.get(measurement.customer_id);
    const customer = customerRes?.customer ?? customerRes;

    if (!customer) {
        throw error(404, "Customer not found");
    }

    return {
        measurement,
        customer
    };
}

/* =====================================================================
 * ACTIONS
 * ===================================================================== */
export const actions = {

    /* ---------------------------------------------
     * 保存 measurement
     * --------------------------------------------- */
    save: async ({ request, params, locals }) => {

        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            return { success: false, error: 'Forbidden' };
        }

        const id = Number(params.id);
        const form = await request.formData();
        const data = Object.fromEntries(form.entries());

        const res = await api.measurements.update(id, data);

        if (!res || res.error) {
            return { success: false, error: res?.error || 'Update failed' };
        }

        return { success: true };
    },


    /* ---------------------------------------------
     * 删除 measurement
     * --------------------------------------------- */
    delete: async ({ params, locals }) => {

        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            return { success: false, error: 'Forbidden' };
        }

        const id = Number(params.id);

        // 1️⃣ 删除前先读取 measurement → 拿 customer_id
        const raw = await api.measurements.get(id);
        const measurement = raw?.measurement ?? raw;

        if (!measurement || !measurement.customer_id) {
            return { success: false, error: "Cannot load measurement before delete" };
        }

        const customerId = measurement.customer_id;

        // 2️⃣ 删除
        const res = await api.measurements.delete(id);

        if (!res || res.error) {
            return { success: false, error: res?.error || "Delete failed" };
        }

        // 3️⃣ 重定向到客户详情页
        throw redirect(303, `/admin/customers/${customerId}`);
    }
};
