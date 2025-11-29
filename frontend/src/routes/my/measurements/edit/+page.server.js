// frontend\src\routes\my\measurements\edit\+page.server.js

import { redirect, fail } from '@sveltejs/kit';
import { api } from '$lib/server/api';

// ✅ load 函数：从父级获取数据
export async function load({ parent }) {
  const parentData = await parent();
  return {
    measurements: parentData.measurements
  };
}

// ✅ actions：处理表单提交
export const actions = {
  default: async ({ request, locals, fetch, cookies }) => {
    
    console.log('🎯 [ACTION] Form submission started');
    
    if (!locals.authUser) {
        throw redirect(302, '/auth/login');
    }

    const formData = await request.formData();
    
    const measurementsData = {
      height: parseFloat(formData.get('height')),
      weight: formData.get('weight') ? parseFloat(formData.get('weight')) : null,
      chest: parseFloat(formData.get('chest')),
      waist: parseFloat(formData.get('waist')),
      hip: parseFloat(formData.get('hip')),
      shoulder_width: parseFloat(formData.get('shoulder_width')),
      sleeve_length: parseFloat(formData.get('sleeve_length')),
      inseam: parseFloat(formData.get('inseam')),
      neck: formData.get('neck') ? parseFloat(formData.get('neck')) : null,
      notes: formData.get('notes')?.toString() || ''
    };

    console.log('📦 [ACTION] Data to save:', measurementsData);

    try {
      // ⭐ 关键：传递 context 作为第二个参数
      await api.my.saveMeasurements(measurementsData, { fetch, cookies });
      
      console.log('✅ [ACTION] Save successful');
      
    } catch (err) {
      console.error('❌ [ACTION] Save failed:', err);
      return fail(500, { 
        error: 'Failed to save measurements: ' + err.message,
        data: measurementsData 
      });
    }

    throw redirect(303, '/my/measurements');
  }
};