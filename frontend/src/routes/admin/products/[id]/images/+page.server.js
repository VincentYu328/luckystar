// src/routes/admin/products/[id]/images/+page.server.js
import { error } from '@sveltejs/kit';
import { SERVER_API_URL } from '$env/static/private';

function buildCookieHeader(cookies) {
  return cookies.getAll().map(({ name, value }) => `${name}=${value}`).join('; ');
}

export async function load({ params, fetch, cookies, locals }) {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🎬 IMAGES PAGE LOAD STARTED                                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('📍 Product ID:', params.id);
  console.log('👤 User:', locals.authUser ? `${locals.authUser.full_name} (${locals.authUser.type})` : 'NOT LOGGED IN');
  
  const user = locals.authUser;
  if (!user || user.type !== 'staff') {
    console.log('❌ AUTH FAILED: User is not staff');
    throw error(403, 'Staff only');
  }
  console.log('✅ Auth check passed');

  const { id } = params;
  const cookieHeader = buildCookieHeader(cookies);

  // ===== 获取产品信息 =====
  console.log('\n📦 Fetching product info...');
  console.log('   URL:', `${SERVER_API_URL}/api/products/${id}`);
  
  let productRes;
  try {
    productRes = await fetch(`${SERVER_API_URL}/api/products/${id}`, {
      headers: cookieHeader ? { cookie: cookieHeader } : {}
    });
    console.log('   Response status:', productRes.status, productRes.statusText);
  } catch (err) {
    console.log('❌ FETCH ERROR:', err.message);
    throw error(500, `Failed to fetch product: ${err.message}`);
  }

  if (!productRes.ok) {
    const errorText = await productRes.text();
    console.log('❌ PRODUCT FETCH FAILED:', errorText);
    throw error(productRes.status, errorText);
  }

  const productData = await productRes.json();
  console.log('   Product data:', JSON.stringify(productData, null, 2));
  
  // 处理两种可能的响应格式
  let product;
  if (productData?.product) {
    // 格式1: { product: {...} }
    product = productData.product;
    console.log('   ✓ Found product in "product" field');
  } else if (productData?.id) {
    // 格式2: 直接返回产品对象
    product = productData;
    console.log('   ✓ Product data is direct object');
  } else {
    console.log('❌ PRODUCT NOT FOUND in response');
    throw error(404, 'Product not found');
  }
  console.log('✅ Product loaded:', product.name);

  // ===== 获取图片列表 =====
  console.log('\n🖼️  Fetching images...');
  console.log('   URL:', `${SERVER_API_URL}/api/products/${id}/images`);
  
  let imagesRes;
  try {
    imagesRes = await fetch(`${SERVER_API_URL}/api/products/${id}/images`, {
      headers: cookieHeader ? { cookie: cookieHeader } : {}
    });
    console.log('   Response status:', imagesRes.status, imagesRes.statusText);
  } catch (err) {
    console.log('⚠️  IMAGES FETCH ERROR (non-fatal):', err.message);
  }

  const imagesData = imagesRes && imagesRes.ok ? await imagesRes.json() : { images: [] };
  console.log('   Images data:', JSON.stringify(imagesData, null, 2));
  console.log('✅ Images loaded:', imagesData.images?.length || 0, 'items');

  console.log('\n🎉 LOAD COMPLETED SUCCESSFULLY');
  console.log('════════════════════════════════════════════════════════════════\n');

  return {
    product: product,  // 使用我们处理过的 product 变量
    images: imagesData.images ?? [],
    error: null,
    success: false
  };
}

export const actions = {
  upload: async ({ request, params, fetch, cookies, locals }) => {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  📸 UPLOAD ACTION TRIGGERED                                  ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
      console.log('❌ AUTH FAILED in upload action');
      throw error(403, 'Staff only');
    }

    const { id } = params;
    const formData = await request.formData();
    const cookieHeader = buildCookieHeader(cookies);

    console.log('📍 Product ID:', id);
    console.log('📋 FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`   ${key}:`, {
          name: value.name,
          size: value.size,
          type: value.type
        });
      } else {
        console.log(`   ${key}:`, value);
      }
    }
    
    const imageFile = formData.get('image');
    console.log('📎 File present:', imageFile ? 'YES' : 'NO');
    
    if (!imageFile || !(imageFile instanceof File) || imageFile.size === 0) {
      console.log('❌ No valid file uploaded');
      return {
        success: false,
        error: 'Please select an image file'
      };
    }
    
    console.log('✅ Valid file:', imageFile.name, imageFile.size, 'bytes');

    console.log('\n📤 Sending to backend...');
    console.log('   URL:', `${SERVER_API_URL}/api/products/${id}/images`);

    try {
      // 创建新的 FormData，添加可能需要的字段
      const uploadFormData = new FormData();
      uploadFormData.append('image', imageFile);
      uploadFormData.append('display_order', '0');
      uploadFormData.append('is_primary', 'false');
      
      console.log('📋 Sending FormData with:');
      for (const [key, value] of uploadFormData.entries()) {
        if (value instanceof File) {
          console.log(`   ${key}: [File] ${value.name}`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      }

      const res = await fetch(`${SERVER_API_URL}/api/product-images/${id}/upload`, {
        method: 'POST',
        headers: cookieHeader ? { cookie: cookieHeader } : {},
        body: uploadFormData
      });

      console.log('   Response status:', res.status, res.statusText);
      
      const data = await res.json();
      console.log('   Response data:', JSON.stringify(data, null, 2));

      if (!res.ok || data?.error) {
        console.log('❌ UPLOAD FAILED:', data?.error || res.statusText);
        return {
          success: false,
          error: data?.error || `Upload failed: ${res.statusText}`
        };
      }

      console.log('✅ UPLOAD SUCCESSFUL!');
      console.log('════════════════════════════════════════════════════════════════\n');
      
      return {
        success: true,
        error: null
      };
      
    } catch (err) {
      console.log('❌ UPLOAD EXCEPTION:', err.message);
      console.log('   Stack:', err.stack);
      
      return {
        success: false,
        error: err.message ?? 'Upload failed'
      };
    }
  },

  delete: async ({ request, params, fetch, cookies, locals }) => {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  🗑️  DELETE ACTION TRIGGERED                                 ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
      console.log('❌ AUTH FAILED in delete action');
      throw error(403, 'Staff only');
    }

    const { id } = params;
    const formData = await request.formData();
    const imageId = formData.get('imageId');
    const cookieHeader = buildCookieHeader(cookies);

    console.log('📍 Product ID:', id);
    console.log('🖼️  Image ID:', imageId);
    console.log('\n📤 Sending delete request...');
    console.log('   URL:', `${SERVER_API_URL}/api/products/images/${imageId}`);

    try {
      const res = await fetch(`${SERVER_API_URL}/api/products/images/${imageId}`, {
        method: 'DELETE',
        headers: cookieHeader ? { cookie: cookieHeader } : {}
      });

      console.log('   Response status:', res.status, res.statusText);
      
      const data = await res.json();
      console.log('   Response data:', JSON.stringify(data, null, 2));

      if (!res.ok || data?.error) {
        console.log('❌ DELETE FAILED:', data?.error || res.statusText);
        return {
          success: false,
          error: data?.error || `Delete failed: ${res.statusText}`
        };
      }

      console.log('✅ DELETE SUCCESSFUL!');
      console.log('════════════════════════════════════════════════════════════════\n');
      
      return {
        success: true,
        error: null
      };
      
    } catch (err) {
      console.log('❌ DELETE EXCEPTION:', err.message);
      
      return {
        success: false,
        error: err.message ?? 'Delete failed'
      };
    }
  },

  setPrimary: async ({ request, params, fetch, cookies, locals }) => {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  ⭐ SET PRIMARY ACTION TRIGGERED                             ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
      console.log('❌ AUTH FAILED in setPrimary action');
      throw error(403, 'Staff only');
    }

    const { id } = params;
    const formData = await request.formData();
    const imageId = formData.get('imageId');
    const cookieHeader = buildCookieHeader(cookies);

    console.log('📍 Product ID:', id);
    console.log('🖼️  Image ID:', imageId);
    console.log('\n📤 Sending set primary request...');
    console.log('   URL:', `${SERVER_API_URL}/api/products/images/${imageId}/primary`);

    try {
      const res = await fetch(`${SERVER_API_URL}/api/products/images/${imageId}/primary`, {
        method: 'PUT',
        headers: cookieHeader ? { cookie: cookieHeader } : {}
      });

      console.log('   Response status:', res.status, res.statusText);
      
      const data = await res.json();
      console.log('   Response data:', JSON.stringify(data, null, 2));

      if (!res.ok || data?.error) {
        console.log('❌ SET PRIMARY FAILED:', data?.error || res.statusText);
        return {
          success: false,
          error: data?.error || `Set primary failed: ${res.statusText}`
        };
      }

      console.log('✅ SET PRIMARY SUCCESSFUL!');
      console.log('════════════════════════════════════════════════════════════════\n');
      
      return {
        success: true,
        error: null
      };
      
    } catch (err) {
      console.log('❌ SET PRIMARY EXCEPTION:', err.message);
      
      return {
        success: false,
        error: err.message ?? 'Set primary failed'
      };
    }
  }
};