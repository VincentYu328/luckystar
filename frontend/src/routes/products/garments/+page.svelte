<script>
  export let data;
  const garments = data.garments ?? [];
</script>

<svelte:head>
  <title>Garments — Lucky Star Fashion</title>
  <meta name="description" content="Island-style garments, church uniforms, family sets and custom clothing for the Pacific community in Auckland." />
</svelte:head>

<!-- 全屏背景 + 统一风格 -->
<section class="garments-page">
  <div class="page-container">

    <h1 class="page-title">Garments</h1>

    <!-- 分类导航 -->
    <div class="category-grid">
      <a href="/products/garments/mens"   class="category-card">Men</a>
      <a href="/products/garments/womens" class="category-card">Women</a>
      <a href="/products/garments/boys"   class="category-card">Boys</a>
      <a href="/products/garments/girls"  class="category-card">Girls</a>
    </div>

    <!-- 最新成衣 -->
    <div class="latest-section">
      <h2 class="section-title">Latest Garments</h2>

      {#if garments.length === 0}
        <p class="empty-text">No garments available at the moment.<br>New stock coming soon!</p>
      {:else}
        <div class="garments-grid">
          {#each garments.slice(0, 6) as g}
            <a href={`/products/item/${g.id}`} class="garment-card">

              <!-- 如果有缩略图可以放这里 -->
              <!-- <img src={g.thumbnail} alt={g.name} class="garment-thumb" /> -->

              <h3 class="garment-name">{g.name}</h3>

              <div class="garment-details">
                {#if g.color}<p><strong>Colour:</strong> {g.color}</p>{/if}
                {#if g.style}<p><strong>Style:</strong> {g.style}</p>{/if}
                {#if g.gender}<p><strong>For:</strong> {g.gender}</p>{/if}
              </div>

              <div class="garment-price">${g.base_price}</div>
            </a>
          {/each}
        </div>
      {/if}
    </div>

  </div>
</section>

<style>
  :global(body) { margin: 0; font-family: system-ui, sans-serif; }

  /* 全屏背景 */
  .garments-page {
    min-height: 62vh;
    background: url('/images/garments.png') center/cover no-repeat fixed;
    padding: 12vh 1.5rem 10vh;
    position: relative;
  }

  /* 温暖赤褐蒙版 */
  .garments-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(241, 238, 235, 0.58);
    backdrop-filter: blur(1px);
  }

  .page-container {
    position: relative;
    max-width: 1240px;
    margin: 0 auto;
  }

  /* 大标题 */
  .page-title {
    font-size: clamp(3.2rem, 8vw, 6rem);
    font-weight: 900;
    text-align: center;
    color: #fff4d6;
    margin: 0 0 2rem;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    letter-spacing: 1.5px;
  }

  /* 分类导航 */
  .category-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.8rem;
    max-width: 560px;
    margin: 0 auto 5rem;
  }
  @media (min-width: 640px) {
    .category-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .category-card {
    background: rgba(160, 82, 45, 0.94);
    color: white;
    text-align: center;
    padding: 1.8rem 1rem;
    border-radius: 1.4rem;
    border: 5px solid #FFF8E7;
    font-size: 1.35rem;
    font-weight: 800;
    text-decoration: none;
    transition: all 0.35s ease;
    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  }
  .category-card:hover {
    transform: translateY(-10px);
    background: rgba(180, 92, 55, 0.94);
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  }

  /* Latest Garments 区块 */
  .section-title {
    font-size: 2.2rem;
    font-weight: 900;
    color: white;
    text-align: center;
    margin: 0 0 3rem;
    text-shadow: 0 3px 12px rgba(0,0,0,0.7);
  }

  .empty-text {
    text-align: center;
    font-size: 1.3rem;
    color: #FFF8E7;
    font-weight: 600;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }

  .garments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2.2rem;
  }

  .garment-card {
    display: block;
    background: rgba(160, 82, 45, 0.94);
    border: 5px solid #FFF8E7;
    border-radius: 1.6rem;
    padding: 2rem;
    transition: all 0.35s ease;
    box-shadow: 0 12px 30px rgba(0,0,0,0.4);
    text-decoration: none;
    color: #FFF8E7;
  }
  .garment-card:hover {
    transform: translateY(-12px);
    background: rgba(180, 92, 55, 0.94);
    box-shadow: 0 24px 50px rgba(0,0,0,0.5);
  }

  .garment-name {
    font-size: 1.5rem;
    font-weight: 800;
    color: white;
    margin: 0 0 1rem;
    text-align: center;
  }

  .garment-details {
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 1.2rem;
  }
  .garment-details p { margin: 0.4rem 0; }
  .garment-details strong { color: white; }

  .garment-price {
    font-size: 1.6rem;
    font-weight: 900;
    color: #FFF8E7;
    text-align: center;
    margin-top: 1rem;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }

  /* 手机端 */
  @media (max-width: 640px) {
    .category-grid { grid-template-columns: 1fr 1fr; gap: 1.4rem; }
    .garments-grid { grid-template-columns: 1fr; }
    .garment-card, .category-card { padding: 1.6rem; }
  }
</style>