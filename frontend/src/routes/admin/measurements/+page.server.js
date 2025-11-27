// frontend/src/routes/admin/measurements/+page.server.js

import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    console.log("====================================");
    console.log("🔵 [LOAD START] /admin/measurements");
    console.log("====================================");

    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        console.log("🔴 [ERROR] Forbidden: user not staff");
        throw error(403, 'Forbidden');
    }

    console.log("🟦 Fetching measurement list via api.measurements.list()");

    let list;
    try {
        const res = await api.measurements.list();
        console.log("🟧 [DEBUG] Raw response from API:", res);

        // 统一格式：兼容 { items: [...] } 或直接返回数组
        list = res?.items ?? res ?? [];

        if (!Array.isArray(list)) {
            console.log("🔴 [ERROR] Unexpected measurement list format:", list);
            throw error(500, "Invalid measurement list response");
        }

        console.log("🟢 [SUCCESS] Loaded measurements:", list.length);

    } catch (err) {
        console.log("🔴 [ERROR] Failed loading measurements:", err);
        throw error(500, "Failed to fetch measurement list");
    }

    console.log("====================================");
    console.log("🔵 [LOAD END] /admin/measurements");
    console.log("====================================");

    return {
        measurements: list
    };
}
