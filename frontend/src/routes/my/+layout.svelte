<!-- C:\Users\vince\LuckyStar\frontend\src\routes\my\+layout.svelte -->

<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  // 注意：真正的用户数据来自 +layout.server.js
  export let data;
</script>

<!-- ========================= 已登录视图（父布局） ========================= -->
<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">

    <h1 class="text-5xl font-extrabold text-gray-900 mb-12 tracking-tight">
      My Account
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-10">

      <!-- ================================= 左侧栏 ================================= -->
      <aside class="space-y-6">

        <!-- 用户卡片 -->
        <div class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <div class="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-5 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {data.user.full_name?.[0] ?? 'C'}
          </div>

          <div class="text-2xl font-bold text-gray-900">
            {data.user.full_name || 'Customer'}
          </div>

          <div class="text-sm text-gray-500 mt-1">Customer Account</div>
        </div>

        <!-- 导航 -->
        <nav class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {#each [
            { href: '/my/cart',         icon: '🛒', label: 'My Cart' },
            { href: '/my/orders',       icon: '📦', label: 'My Orders' },
            { href: '/my/measurements', icon: '📏', label: 'My Measurements' },
            { href: '/my/profile',      icon: '⚙️', label: 'Profile Settings' }
          ] as item}

            <a
              href={item.href}
              class="flex items-center gap-5 px-8 py-6 text-lg font-medium transition-all duration-300
                {item.href === $page.url.pathname
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-l-4 border-indigo-600'
                  : 'hover:bg-gray-50 text-gray-700'}"
            >
              <span class="text-2xl">{item.icon}</span>
              <span>{item.label}</span>
            </a>

          {/each}
        </nav>

        <!-- 退出按钮 -->
        <form method="POST" action="/auth/logout">
          <button
            class="w-full py-6 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold text-lg rounded-3xl shadow-xl hover:scale-105 transition"
          >
            <span class="text-2xl">🚪</span> Sign Out
          </button>
        </form>

      </aside>

      <!-- ================================= 右侧主内容 ================================= -->
      <main class="lg:col-span-3">
        <slot />   <!-- 子路由内容 -->
      </main>

    </div>
  </div>
</div>
