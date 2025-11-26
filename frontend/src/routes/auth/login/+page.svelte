<script>
  export let data;

  let email = '';
  let password = '';
  let isStaffLogin = false;
</script>

<svelte:head>
  <title>Login — Lucky Star Fashion</title>
</svelte:head>

<section class="login-page">
  <div class="overlay"></div>

  <div class="login-container">
    <div class="login-card">
      <h2>{isStaffLogin ? 'Staff Login' : 'Login'}</h2>

      <!-- ⭐ 移除 action 属性，直接 POST 到当前页面 -->
      <form method="POST" class="login-form">
        <label for="email">Email</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          bind:value={email}
          required 
        />

        <label for="password">Password</label>
        <input 
          id="password" 
          name="password" 
          type="password" 
          bind:value={password}
          required 
        />

        <label class="switch">
          <input 
            type="checkbox" 
            name="isStaff" 
            value="1" 
            bind:checked={isStaffLogin}
          />
          <span class="slider"></span>
          <span class="switch-text">Login as Staff</span>
        </label>

        <!-- ⭐ 如果有 redirect 参数，传递它 -->
        {#if data.redirectTo}
          <input type="hidden" name="redirect" value={data.redirectTo} />
        {/if}

        <button type="submit" class="login-btn">Login</button>
      </form>

      <p class="register-link">
        Not registered yet? <a href="/auth/register">Create an account</a>
      </p>
    </div>
  </div>
</section>

<style>
  .login-page {
    min-height: 76vh;
    background: url('/images/login.png') center/cover no-repeat fixed;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(243, 179, 115, 0.68);
    backdrop-filter: blur(2px);
    pointer-events: none;
    z-index: 1;
  }

  .login-container {
    position: relative;
    width: 100%;
    max-width: 420px;
    z-index: 10;
  }

  .login-card {
    background: rgba(160, 82, 45, 0.96);
    border: 6px solid #fff8e7;
    border-radius: 1.8rem;
    padding: 2.5rem 2rem;
    color: #fff8e7;
    text-align: center;
    position: relative;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .login-form label {
    text-align: left;
    font-weight: 600;
    margin-bottom: -0.8rem;
  }

  .login-form input[type="email"],
  .login-form input[type="password"] {
    padding: 0.8rem;
    border: 2px solid #fff8e7;
    border-radius: 0.5rem;
    background: rgba(255, 248, 231, 0.95);
    color: #a0522d;
    font-size: 1rem;
  }

  .login-form input[type="email"]:focus,
  .login-form input[type="password"]:focus {
    outline: none;
    border-color: #f3b373;
    background: #fff8e7;
  }

  .switch {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
    user-select: none;
  }

  .switch input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    width: 52px;
    height: 28px;
    background: #8b4513;
    border-radius: 50px;
    position: relative;
    transition: background 0.3s;
    flex-shrink: 0;
  }

  .slider:before {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    left: 4px;
    top: 3px;
    background: #fff8e7;
    border-radius: 50%;
    transition: transform 0.3s;
  }

  .switch input:checked + .slider {
    background: #f3b373;
  }

  .switch input:checked + .slider:before {
    transform: translateX(24px);
  }

  .switch-text {
    color: #fff8e7;
    font-size: 0.95rem;
  }

  .login-btn {
    margin-top: 1rem;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 700;
    background: #fff8e7;
    color: #a0522d;
    border: none;
    border-radius: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .login-btn:hover {
    background: #f3b373;
    color: #fff8e7;
    transform: translateY(-2px);
  }

  .register-link {
    margin-top: 1.5rem;
    font-size: 0.95rem;
  }

  .register-link a {
    color: #f3b373;
    text-decoration: underline;
  }

  .register-link a:hover {
    color: #fff8e7;
  }
</style>