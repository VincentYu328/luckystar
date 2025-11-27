<li><button on:click={handleLogout} class="logout-btn">Logout</button></li>

<script>
  import { logout } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';

  async function handleLogout() {
      await logout();     // 前端 store 自动刷新
      goto('/');          // 强制导航刷新
  }
</script>
