<script>
	import { goto } from '$app/navigation';

	let full_name = '';
	let email = '';
	let phone = '';
	let password = '';
	let isLoading = false;

	async function handleRegister() {
		if (!full_name || !email || !phone || !password) {
			alert('Please fill in all fields');
			return;
		}

		isLoading = true;

		try {
			const res = await fetch('/api/customer-auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ full_name, email, phone, password })
			});

			const data = await res.json();

			if (!res.ok) {
				alert(data.error || 'Registration failed');
				return;
			}

			// 注册成功 → 跳转登录页
			alert('Account created successfully! Please log in.');
			goto('/auth/login?registered=true');
		} catch (err) {
			alert('Network error, please try again');
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Register — Lucky Star Fashion</title>
	<meta name="description" content="Create your customer account at Lucky Star Fashion" />
</svelte:head>

<!-- 全屏背景 + 居中注册卡片（和 Login 完全一致） -->
<section class="register-page">
	<div class="overlay" />

	<div class="register-container">
		<div class="register-card">
			<h2>Create Your Account</h2>

			<form on:submit|preventDefault={handleRegister} class="register-form">
				<label for="name">Full Name</label>
				<input id="name" bind:value={full_name} required placeholder="e.g. Maria Tui" />

				<label for="email">Email</label>
				<input id="email" type="email" bind:value={email} required placeholder="maria@example.com" />

				<label for="phone">Phone Number</label>
				<input id="phone" bind:value={phone} required placeholder="+64 21 123 4567" />

				<label for="password">Password</label>
				<input id="password" type="password" bind:value={password} required placeholder="Minimum 6 characters" minlength="6" />

				<button type="submit" class="register-btn" disabled={isLoading}>
					{#if isLoading}
						Creating Account...
					{:else}
						Register
					{/if}
				</button>
			</form>

			<p class="login-link">
				Already have an account? <a href="/auth/login">Log in here</a>
			</p>
		</div>
	</div>
</section>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, -apple-system, sans-serif;
	}

	/* 完全复用 Login 页面的背景和蒙版 */
	.register-page {
		min-height: 70vh;
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
		background: linear-gradient(135deg,
			rgba(255, 130, 110, 0.62) 0%,
			rgba(100, 200, 255, 0.48) 70%
		);
		backdrop-filter: blur(2px);
	}

	.register-container {
		position: relative;
		width: 100%;
		max-width: 420px;
	}

	.register-card {
		background: rgba(255, 255, 255, 0.92);
		border: 6px solid #fff8e7;
		border-radius: 1.8rem;
		padding: 2.5rem 2rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
		color: #333;
		text-align: center;
		backdrop-filter: blur(2px);
	}

	h2 {
		font-size: clamp(2rem, 4vw, 1.5rem);
		font-weight: 900;
		margin: 0 0 1.8rem;
		color: #ff5f57;	
		letter-spacing: 1px;
	}

	.register-form {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
		text-align: left;
	}

	label {
		font-weight: 600;
		font-size: 0.95rem;
		color: #2c3e50;
		margin-bottom: 0.4rem;
	}

	input {
		padding: 0.9rem 1rem;
		border: none;
		border-radius: 0.8rem;
		font-size: 1rem;
		background: rgba(255, 248, 231, 0.4);
		color: #333;
		transition: all 0.3s ease;
	}

	input::placeholder {
		color: rgba(0, 0, 0, 0.5);
	}

	input:focus {
		outline: 3px solid #ff8e8a;
		background: rgba(255, 248, 231, 0.6);
	}

	/* 注册按钮（和登录按钮完全一致风格） */
	.register-btn {
		margin-top: 1rem;
		padding: 1rem;
		font-size: 1.1rem;
		font-weight: 700;
		color: white;
		background: linear-gradient(135deg, #ff5f57, #ff8e8a);
		border: none;
		border-radius: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 6px 20px rgba(255, 95, 87, 0.4);
	}

	.register-btn:hover:not(:disabled) {
		transform: translateY(-3px);
		box-shadow: 0 12px 30px rgba(255, 95, 87, 0.5);
		background: linear-gradient(135deg, #ff4444, #ff7777);
	}

	.register-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	.login-link {
		margin-top: 1.8rem;
		font-size: 0.95rem;
		color: #2c3e50;
	}

	.login-link a {
		color: #ff5f57;
		font-weight: 700;
		text-decoration: underline;
	}

	.login-link a:hover {
		color: #ff3333;
	}

	/* 手机端优化 */
	@media (max-width: 480px) {
		.register-card {
			padding: 2rem 1.5rem;
			border-width: 4px;
		}
	}
</style>