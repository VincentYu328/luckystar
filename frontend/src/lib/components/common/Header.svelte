<script>
  import { isLoggedIn, user } from '$lib/stores/auth.js';
  import { page } from '$app/stores';

  let mobileOpen = false;
  const toggle = () => (mobileOpen = !mobileOpen);
  const close = () => (mobileOpen = false);
</script>

<header class="site-header" class:mobileOpen>
  <nav class="nav-container">

    <!-- LOGO -->
    <a href="/" class="brand">
      <img src="/images/logo.svg" alt="Lucky Star" class="logo" />
      <span class="brand-text">Lucky Star</span>
    </a>

    <!-- ================== DESKTOP NAV ================== -->
    <ul class="desktop-nav">

      <!-- 永远显示的主导航 -->
      <li><a href="/products"          class:active={$page.url.pathname.startsWith('/products')}>Products</a></li>
      <li><a href="/products/fabrics"  class:active={$page.url.pathname === '/products/fabrics'}>Fabrics</a></li>
      <li><a href="/products/garments" class:active={$page.url.pathname === '/products/garments'}>Garments</a></li>
      <li><a href="/size-guide"        class:active={$page.url.pathname === '/size-guide'}>Size Guide</a></li>
      <li><a href="/about"             class:active={$page.url.pathname === '/about'}>About</a></li>

      {#if $isLoggedIn}

        {#if $user?.type === 'customer'}
          <!-- ⭐ Customer：只增加 My Account，不显示 Logout -->
          <li>
            <a href="/my" class:active={$page.url.pathname.startsWith('/my')}>
              My Account
            </a>
          </li>

        {:else if $user?.type === 'staff'}
          <!-- ⭐ Staff：正常显示 Admin + Logout -->
          <li><a href="/admin" class:active={$page.url.pathname.startsWith('/admin')}>Admin</a></li>
          <li><a href="/auth/logout" class="logout-btn">Logout</a></li>
        {/if}

      {:else}
        <!-- ⭐ 未登录：显示 Login -->
        <li><a href="/auth/login" class="login-btn">Login</a></li>
      {/if}

    </ul>

    <!-- =============== MOBILE HAMBURGER =============== -->
    <button class="mobile-menu-btn" on:click={toggle}>
      <div class="hamburger" class:open={mobileOpen}>
        <span></span><span></span><span></span>
      </div>
    </button>

  </nav>

  <!-- ================= MOBILE NAV ================= -->
  <div class="mobile-dropdown" class:open={mobileOpen}>
    <ul class="mobile-nav">

      <!-- 永远显示的主导航 -->
      <li><a href="/products"          on:click={close}>Products</a></li>
      <li><a href="/products/fabrics"  on:click={close}>Fabrics</a></li>
      <li><a href="/products/garments" on:click={close}>Garments</a></li>
      <li><a href="/size-guide"        on:click={close}>Size Guide</a></li>
      <li><a href="/about"             on:click={close}>About</a></li>

      {#if $isLoggedIn}

        {#if $user?.type === 'customer'}
          <!-- ⭐ Customer：只显示 My Account -->
          <li><a href="/my" on:click={close}>My Account</a></li>

        {:else if $user?.type === 'staff'}
          <!-- ⭐ Staff：Admin + Logout -->
          <li><a href="/admin" on:click={close}>Admin</a></li>
          <li><a href="/auth/logout" on:click={close} class="mobile-logout">Logout</a></li>
        {/if}

      {:else}
        <!-- ⭐ 未登录 -->
        <li><a href="/auth/login" on:click={close} class="mobile-login">Login</a></li>
      {/if}

    </ul>
  </div>
</header>

<style>
  :global(body) { margin: 0; }

  .site-header {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 50;
    height: 78px;
    background: rgba(196, 219, 111, 0.94);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  }

  .nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    text-decoration: none;
    font-size: 1.95rem;
    font-weight: 800;
    color: #FFF8E7;
  }

  .logo { width: 48px; height: 48px; }

  .desktop-nav {
    display: none;
    gap: 3rem;
    align-items: center;
    list-style: none;
  }
  @media (min-width: 1024px) {
    .desktop-nav { display: flex; }
  }

  .desktop-nav a {
    color: #FFF8E7;
    font-size: 1.1rem;
    font-weight: 700;
    text-decoration: none;
    position: relative;
  }

  .desktop-nav a.active::after {
    content: '';
    position: absolute;
    bottom: -10px; left: 0; right: 0;
    height: 3px;
    background: white;
    border-radius: 2px;
  }

  .login-btn {
    background: #FFD880;
    color: #5D3A1A;
    padding: 0.75rem 2rem;
    border-radius: 999px;
    font-weight: 800;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  }

  .mobile-menu-btn {
    display: block;
    background: none;
    border: none;
    padding: 0.6rem;
  }
  @media (min-width: 1024px) {
    .mobile-menu-btn { display: none; }
  }

  .hamburger span {
    display: block;
    width: 28px;
    height: 4px;
    background: #FFF8E7;
    margin: 5px 0;
    border-radius: 2px;
  }

  .mobile-dropdown {
    position: absolute;
    top: 78px;
    left: 0; right: 0;
    background: rgba(196, 219, 111, 0.94);
    backdrop-filter: blur(12px);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.45s ease;
  }
  .mobile-dropdown.open { max-height: 80vh; }

  .mobile-nav {
    padding: 1.5rem 0;
    list-style: none;
  }

  .mobile-nav a {
    display: block;
    padding: 1.1rem 2rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #FFF8E7;
    text-decoration: none;
  }

  .mobile-login { color: #FFD880; }
  .mobile-logout { color: #FFB3B3; }
</style>
