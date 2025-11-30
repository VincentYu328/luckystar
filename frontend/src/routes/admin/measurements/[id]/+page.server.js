// frontend/src/routes/admin/measurements/[id]/+page.server.js

import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

/* =====================================================================
 * LOAD
 * ===================================================================== */
export async function load({ locals, params, fetch, cookies }) {

    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const measurementId = Number(params.id);
    if (!measurementId) {
        throw error(400, "Invalid measurement ID");
    }

    // ---- 获取 measurement ----
    const raw = await api.measurements.get(measurementId, { fetch, cookies });
    const measurement = raw?.measurement ?? raw;

    if (!measurement || !measurement.id) {
        throw error(404, "Measurement not found");
    }

    // Check if measurement is for customer or group member
    if (!measurement.customer_id && !measurement.group_member_id) {
        throw error(500, "Measurement missing customer_id or group_member_id");
    }

    let customer = null;
    let groupMember = null;
    let groupOrder = null;

    if (measurement.customer_id) {
        // ---- 获取客户 ----
        const customerRes = await api.customers.get(measurement.customer_id, { fetch, cookies });
        customer = customerRes?.customer ?? customerRes;

        if (!customer) {
            throw error(404, "Customer not found");
        }
    } else if (measurement.group_member_id) {
        // ---- 获取团体成员信息 ----
        // The measurement already includes customer_name from the group_member join
        groupMember = {
            id: measurement.group_member_id,
            full_name: measurement.customer_name || 'Group Member'
        };
    }

    return {
        measurement,
        customer,
        groupMember,
        isGroupMember: !!measurement.group_member_id
    };
}

/* =====================================================================
 * ACTIONS
 * ===================================================================== */
export const actions = {

    /* ---------------------------------------------
     * 保存 measurement
     * --------------------------------------------- */
    save: async ({ request, params, locals, fetch, cookies }) => {

        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            return { success: false, error: 'Forbidden' };
        }

        const id = Number(params.id);
        const form = await request.formData();
        const data = Object.fromEntries(form.entries());

        const res = await api.measurements.update(id, data, { fetch, cookies });

        if (!res || res.error) {
            return { success: false, error: res?.error || 'Update failed' };
        }

        return { success: true };
    },


    /* ---------------------------------------------
     * 删除 measurement
     * --------------------------------------------- */
    delete: async ({ params, locals, fetch, cookies }) => {

        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            return { success: false, error: 'Forbidden' };
        }

        const id = Number(params.id);

        // 1️⃣ 删除前先读取 measurement → 拿 customer_id 或 group_member_id
        const raw = await api.measurements.get(id, { fetch, cookies });
        const measurement = raw?.measurement ?? raw;

        if (!measurement) {
            return { success: false, error: "Cannot load measurement before delete" };
        }

        // 2️⃣ 删除
        const res = await api.measurements.delete(id, { fetch, cookies });

        if (!res || res.error) {
            return { success: false, error: res?.error || "Delete failed" };
        }

        // 3️⃣ 重定向
        if (measurement.customer_id) {
            // Redirect to customer detail page
            throw redirect(303, `/admin/customers/${measurement.customer_id}`);
        } else {
            // Redirect to measurements list for group members
            throw redirect(303, '/admin/measurements');
        }
    }
};
