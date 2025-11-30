// frontend/src/routes/admin/inventory/out/+page.server.js
import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') throw error(403);

    const fabricRes = await api.inventory.fabricList();
    const garmentRes = await api.inventory.garmentList();

    return {
        fabrics: Array.isArray(fabricRes.stock) ? fabricRes.stock : [], // 修正为 'stock'
        garments: Array.isArray(garmentRes.stock) ? garmentRes.stock : [], // 修正为 'stock'
        user
    };
}

export const actions = {
    create: async ({ request, locals }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') throw error(403);

        const formData = await request.formData();
        const payload = Object.fromEntries(formData);

        console.log("\n===========================");
        console.log("📥 RAW FORM DATA:", payload);

        // ★ 修复1：把 "" 转为 null ————避免外键错误
        for (const key in payload) {
            if (payload[key] === "") {
                console.log(`🔄 Empty string detected → converting: ${key} = null`);
                payload[key] = null;
            }
        }

        console.log("📦 CLEANED PAYLOAD:", payload);

        const { fabric_id, used_quantity } = payload;

        // ★ 打印关键字段
        console.log("🔎 fabric_id:", fabric_id);
        console.log("🔎 used_quantity:", used_quantity);
        console.log("🔎 garment_id:", payload.garment_id);

        if (!fabric_id || !used_quantity) {
            console.log("❌ Missing required fields");
            return {
                success: false,
                error: "fabric_id and used_quantity are required."
            };
        }

        console.log("➡️ Calling API: inventory.fabricUsage()");
        const res = await api.inventory.fabricUsage(payload);

        console.log("📨 API Response:", res);

        if (res?.error) {
            console.log("❌ API ERROR:", res.error);
            return {
                success: false,
                error: res.error
            };
        }

        console.log("✅ SUCCESS: Redirecting to /admin/inventory");
        console.log("===========================\n");

        throw redirect(303, '/admin/inventory');
    }
};
