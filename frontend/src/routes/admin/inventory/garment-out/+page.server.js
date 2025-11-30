// frontend/src/routes/admin/inventory/garment-out/+page.server.js

import { api } from '$lib/server/api.js';           // 你的路径如果是 $lib/server/api.js 就改回去
import { error, redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

/** 页面加载：获取成衣库存列表 */
export const load = async ({ locals }) => {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    try {
        const res = await api.inventory.garmentList();
        const garments = Array.isArray(res.stock) ? res.stock : [];

        return { garments };
    } catch (err) {
        console.error('加载成衣库存失败:', err);
        throw error(500, '无法加载成衣库存');
    }
};

/** 表单提交：记录成衣销售/出库 */
export const actions = {
    create: async ({ request, locals }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const f = await request.formData();

        const garmentId  = f.get('garment_id');      // <select name="garment_id">
        const quantity   = f.get('quantity');        // <input name="quantity">
        const saleType   = f.get('sale_type');       // <select name="sale_type">
        const reference  = f.get('reference')?.toString().trim() || null;
        const notes      = f.get('notes')?.toString().trim() || null;

        // 必填校验
        if (!garmentId || !quantity || !saleType) {
            return fail(400, {
                error: '成衣、数量、销售类型为必填项'
            });
        }

        const qty = Number(quantity);
        const gid = Number(garmentId);

        if (isNaN(gid) || isNaN(qty) || qty <= 0) {
            return fail(400, {
                error: '数量必须是大于 0 的整数'
            });
        }

        // 与后端完全一致的 payload（camelCase）
        const payload = {
            garmentId: gid,          // 后端 Service 用 garmentId
            quantity: qty,
            saleType: saleType,      // retail / wholesale / sample
            reference: reference,    // 订单号、客户名等文字说明
            remark: notes            // 备注
        };

        // ------------------- 关键：正确处理 redirect -------------------
        try {
            const result = await api.inventory.garmentSale(payload);

            // 正常情况下后端返回 { success: true }
            if (result?.success) {
                // 成功 → 直接跳转，带成功标记
                throw redirect(303, '/admin/inventory?success=garment_sale');
            }

            // 后端返回了 error 字段（极少见）
            return fail(400, {
                error: result?.error || '出库失败（未知错误）'
            });

        } catch (err) {
            // 只有真正的网络错误或后端抛错才进这里
            // 如果 err 是 SvelteKit 的 redirect 对象，直接抛出去（成功跳转）
            if (err?.status === 303 && err?.location) {
                throw err;   // 这是成功跳转，别拦着它！
            }

            // 真正的错误才打印和返回
            console.error('成衣销售真的失败了:', err);
            return fail(400, {
                error: err.message || '出库失败，请重试'
            });
        }
    }
};