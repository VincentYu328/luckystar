import { redirect, error } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export async function load({ locals, fetch, cookies }) {
  const user = locals.authUser;
  if (!user || user.type !== 'staff') {
    throw redirect(302, '/auth/login?redirect=/admin/products');
  }

  const res = await api.products.list({ fetch, cookies });

  return {
    products: res.products ?? [],
    deleteError: null,
    deleteSuccess: false
  };
}

export const actions = {
  delete: async ({ locals, request, fetch, cookies }) => {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
      throw redirect(302, '/auth/login?redirect=/admin/products');
    }

    const form = await request.formData();
    const productId = form.get('product_id');

    if (!productId) {
      return {
        deleteSuccess: false,
        deleteError: 'Missing product id'
      };
    }

    try {
      const res = await api.products.delete({ fetch, cookies }, productId);
      return {
        deleteSuccess: res.success ?? false,
        deleteError: res.error ?? null
      };
    } catch (err) {
      return {
        deleteSuccess: false,
        deleteError: err.message ?? 'Delete failed'
      };
    }
  }
};