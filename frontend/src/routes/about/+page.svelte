<script>
	// 纯展示页面，无逻辑
</script>

<svelte:head>
	<title>About Lucky Star — Fabrics, Garments & Custom Orders</title>
	<meta
		name="description"
		content="Learn about Lucky Star Fashion — a Pacific-inspired fabric and garment house based in Ōtāhuhu, Auckland."
	/>
</svelte:head>

<!-- 全屏背景 + 居中内容卡 -->
<section class="about-page">
	<!-- 轻盈明亮的珊瑚-天蓝渐变蒙版 -->
	<div class="overlay" />

	<div class="about-container">
		<div class="about-card">
			<h1 class="title">About Lucky Star Fashion</h1>
			<p class="subtitle">Pacific-inspired Fabrics · Garments · Custom Orders</p>

			<div class="text-content">
				<p>
					Lucky Star Fashion is a local fabric and garment house rooted in the heart of the Pacific community in Ōtāhuhu, Auckland. For years, we have served families, churches, cultural groups and community organisations with a wide selection of fabrics, ready-made garments, and customised clothing solutions.
				</p>

				<p>
					Our strength comes from our close connection with Pacific cultures — from vibrant church uniforms and matching family sets to island-style garments for celebrations and special occasions.
				</p>

				<p>
					Beyond retail, we offer personalised services including group orders, fabric matching consultation, and custom measurements for adults and children. Every piece is made with care, respect, and alofa.
				</p>

				<p>
					At Lucky Star, we believe clothing carries cultural identity, family connection, and community pride. We are honoured to be part of your story.
				</p>
			</div>

			<div class="store-info card">
				<h2 class="info-title">Visit Our Store</h2>
				<p><strong>Address:</strong> 6 Avenue Road, Ōtāhuhu, Auckland 1062</p>
				<p><strong>Phone:</strong> +64 9 270 6088</p>
				<p><strong>Open:</strong> 7 days a week</p>
			</div>
		</div>
	</div>
</section>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, -apple-system, sans-serif;
	}

	/* ==================== 全屏背景 ==================== */
	.about-page {
		min-height: 60h;
		background: url('/images/about.png') center/cover no-repeat fixed;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4rem 1rem;
	}

	/* 轻盈明亮的蒙版：珊瑚橘 → 天蓝色渐变 + 轻微模糊 */
	.overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg,
			rgba(255, 130, 110, 0.62) 0%,
			rgba(100, 200, 255, 0.48) 70%
		);
		backdrop-filter: blur(2px);
	}

	.about-container {
		position: relative;
		max-width: 900px;
		width: 100%;
	}

	/* 主卡片：干净明亮的白底半透明 */
	.about-card {
		background: rgba(255, 255, 255, 0.92);
		border: 6px solid #fff8e7;
		border-radius: 1.8rem;
		padding: 3rem 2.8rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
		color: #333;
		backdrop-filter: blur(8px);
	}

	/* ==================== 标题 ==================== */
	.title {
		font-size: clamp(2.4rem, 6vw, 3rem);
		font-weight: 900;
		text-align: center;
		color: #ff5f57;                     /* 活力珊瑚橘 */
		margin: 0 0 0.5rem;
		text-shadow: 0 3px 12px rgba(255, 95, 87, 0.3);
		letter-spacing: 1px;
	}

	.subtitle {
		font-size: 1.35rem;
    font-style: italic;
		text-align: center;
		color: #40a0ff;                     /* 清新天蓝 */
		font-weight: 700;
		margin-bottom: 2.5rem;
	}

	/* ==================== 正文 ==================== */
	.text-content {
		font-size: 1.12rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		line-height: 1.2;
		color: #2c3e50;
		margin-bottom: 2.8rem;
	}

	.text-content p {
		margin-bottom: 1.5rem;
	}

	/* ==================== 店铺信息卡片 ==================== */
	.card {
		background: linear-gradient(135deg, #fff8e7 0%, #fef9e8 100%);
		border: 4px solid #ffd70033;
		border-radius: 1.4rem;
		padding: 2rem;
		text-align: center;
		box-shadow: 0 10px 30px rgba(0,0,0,0.12);
	}

	.info-title {
		font-size: 1.6rem;
		font-weight: 800;
		color: #ff5f57;
		margin-bottom: 1.2rem;
	}

	.store-info p {
		margin: 0.9rem 0;
		font-size: 1.08rem;
		color: #2c3e50;
	}

	.store-info strong {
		color: #ff5f57;
	}

	/* ==================== 手机端优化 ==================== */
	@media (max-width: 640px) {
		.about-card {
			padding: 2.2rem 1.8rem;
			margin: 1rem;
			border-width: 5px;
		}
		.title {
			font-size: 2.6rem;
		}
		.text-content {
			font-size: 1.05rem;
		}
	}
</style>