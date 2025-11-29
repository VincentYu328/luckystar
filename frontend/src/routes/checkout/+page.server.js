import { redirect, fail } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export const actions = {
  placeOrder: async ({ locals, request, cookies, fetch }) => {
    const user = locals.authUser;

    if (!user || user.type !== 'customer') {
      throw redirect(302, '/auth/login?redirect=/checkout');
    }

    const form = await request.formData();
    const cart = JSON.parse(form.get('cart') || '[]');

    if (cart.length === 0) {
      return fail(400, { error: 'Cart is empty.' });
    }

    try {
      const result = await api.customerOrders.create(
        { fetch, cookies },
        { items: cart }
      );

      console.log('🧾 Order API result:', result);

      if (!result || !result.id) {
        return fail(500, { error: 'Order creation failed.' });
      }

      // ⭐ 正常跳转
      throw redirect(303, `/checkout/success?order=${result.id}`);

    } catch (err) {

      // ⭐ 关键修复：Redirect 需要放行（不要捕获）
      if (err?.status === 303) {
        throw err;
      }

      console.error('💥 placeOrder failed:', err);

      return fail(500, {
        error: err?.message || 'Order creation failed.'
      });
    }
  }
};