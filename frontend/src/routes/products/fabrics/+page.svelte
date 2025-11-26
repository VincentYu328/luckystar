<script>
  export let data;
  const fabrics = data.fabrics ?? [];
</script>

<svelte:head>
  <title>Fabrics — Lucky Star Fashion</title>
  <meta name="description" content="Browse our range of Pacific-inspired fabrics. Perfect for church uniforms, family sets and island wear." />
</svelte:head>

<!-- 全屏背景 + 统一风格 -->
<section class="fabrics-page">
  <div class="page-container">

    <h1 class="page-title">Fabrics</h1>

    {#if fabrics.length === 0}
      <p class="empty-text">No fabrics available at the moment.<br>Please check back soon!</p>
    {:else}

      <div class="fabrics-grid">
        {#each fabrics as fab}
          <a
            href={`/products/fabrics/${fab.id}`}
            class="fabric-card"
          >
            <!-- 如有缩略图可放这里 -->
            <!-- <img src={fab.thumbnail} alt={fab.name} class="fabric-thumb" /> -->

            <h3 class="fabric-name">{fab.name}</h3>

            <div class="fabric-details">
              {#if fab.color}
                <p><strong>Colour:</strong> {fab.color}</p>
              {/if}
              {#if fab.material}
                <p><strong>Material:</strong> {fab.material}</p>
              {/if}
              {#if fab.width_cm}
                <p><strong>Width:</strong> {fab.width_cm} cm</p>
              {/if}
            </div>

            <div class="fabric-price">
              ${fab.base_price}
            </div>
          </a>
        {/each}
      </div>

    {/if}
  </div>
</section>

<style>
  :global(body) { margin: 0; font-family: system-ui, sans-serif; }

  .fabrics-page {
    min-height: 62vh;
    background: url('/images/fabrics.png') center/cover no-repeat fixed;
    padding: 12vh 1.5rem 10vh;
    position: relative;
  }

  /* 温暖赤褐蒙版 + 轻微模糊，保证文字清晰 */
  .fabrics-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(243, 179, 115, 0.58);
    backdrop-filter: blur(1px);
  }

  .page-container {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* 标题 */
  .page-title {
    font-size: clamp(3.2rem, 8vw, 6rem);
    font-weight: 900;
    text-align: center;
    color: #fff4d6;
    margin: 0 0 2rem;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    letter-spacing: 1.5px;
  }

  .empty-text {
    text-align: center;
    font-size: 1.3rem;
    color: #FFF8E7;
    font-weight: 600;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }

  /* 网格 */
  .fabrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }

  /* 每张卡片 */
  .fabric-card {
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

  .fabric-card:hover {
    transform: translateY(-12px);
    box-shadow: 0 24px 50px rgba(0,0,0,0.5);
    background: rgba(180, 92, 55, 0.94);
  }

  .fabric-name {
    font-size: 1.45rem;
    font-weight: 800;
    color: white;
    margin: 0 0 1rem;
    text-align: center;
  }

  .fabric-details {
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 1.2rem;
  }
  .fabric-details p {
    margin: 0.4rem 0;
  }
  .fabric-details strong {
    color: white;
  }

  .fabric-price {
    font-size: 1.5rem;
    font-weight: 900;
    color: #FFF8E7;
    text-align: center;
    margin-top: 1rem;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }

  /* 手机端优化 */
  @media (max-width: 640px) {
    .fabrics-grid { 
      grid-template-columns: 1fr;
      gap: 1.6rem;
    }
    .fabric-card { padding: 1.8rem; }
  }
</style>