// frontend/src/routes/my/measurements/+page.server.js

import { redirect } from '@sveltejs/kit';
// 导入封装好的 API 工具
import { api } from '$lib/server/api'; 

export async function load({ locals, url }) {
    const user = locals.authUser;

    // 必须是 customer
    if (!user || user.type !== 'customer') {
        const redirectTo = encodeURIComponent(url.pathname + url.search);
        throw redirect(302, `/auth/login?redirect=${redirectTo}`);
    }

    let measurements = null;

    try {
        // =============================
        // ✅ 修正: 使用封装好的 api 工具调用后端 API
        // 它现在会请求正确的路径 /api/customers/me/measurements
        // =============================
        const data = await api.my.measurements();
        
        // 确保 measurements 是单个对象，如果后端返回数组，则取第一个
        // 假设 CustomerService.getMyMeasurements 返回单个对象，这里直接取 data.measurements
        measurements = data.measurements || null;
        
    } catch (error) {
        // 如果 API 调用失败（例如 404/500），捕获错误并返回 null
        console.error("Error fetching measurements in +page.server.js:", error);
        measurements = null; 
    }

    return {
        user,
        measurements
    };
}