<script>
  // export let data;
</script>

<svelte:head>
  <title>Lucky Star Fashion — Fabrics · Garments · Custom Orders</title>
  <meta name="description" content="Lucky Star Fashion in Ōtāhuhu — Pacific fabrics, garments, and custom orders. Dedicated to Polynesian cultures." />
</svelte:head>

<section class="hero">
  <div class="hero-content">

    <h1 class="hero-title">
      Lucky <span class="highlight">Star</span> Fashion
    </h1>

    <p class="hero-subtitle">
      Fabrics · Garments · Custom Orders<br>
      Dedicated to Polynesian Cultures
    </p>

    <div class="hero-buttons">
      <a class="btn primary"   href="/products/fabrics">Browse Fabrics</a>
      <a class="btn secondary" href="/products/garments">Browse Garments</a>
      <a class="btn tertiary"  href="/my/orders">Start My Order</a>
    </div>

  </div>
</section>

<style>
  :global(body, html) { margin:0; padding:0; height:100%; font-family: system-ui, sans-serif; }

  .hero {
    min-height: 84vh;
    background: url('/images/frontpage.png') center/cover no-repeat fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem 1rem;
  }

  .hero-content { max-width: 1100px; }

  /* 标题：纯白＋暖白描边，极简大气 */
.hero-title {
  font-size: clamp(4.2rem, 12vw, 10rem);
  font-weight: 100;
  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-display: swap;
  font-variant: small-caps;
  line-height: 0.94;
  margin: 0 0 3rem;
  color: #FDF3E2; 
  text-shadow:
    0 0 10px rgba(0,0,0,0.55),
    2px 2px 0 rgba(255,255,255,0.25); /* 更轻、更柔 */
}

.highlight {
  background: linear-gradient(180deg, #FFEBCF 0%, #F4C980 100%);
  -webkit-background-clip: text;
  color: transparent;  
  text-shadow:
    0 0 12px rgba(63, 241, 9, 0.55),
    1px 1px 0 rgba(206, 240, 15, 0.25);
}

.hero-subtitle {
  font-size: clamp(1rem, 4vw, 1.5rem);
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  font-style: oblique;
  font-weight: 600;
  color: rgb(10, 241, 126);     /* 暖米白，降低对比 */
  margin: 0 0 5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.45);
}

  /* 按钮：纯正波利尼西亚大地色系 */
  .hero-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1.3rem;
    justify-content: center;
  }

  .btn {
    padding: 0.85rem 2rem;
    border-radius: 999px;
    font-size: 1.2rem;
    font-weight: 800;
    font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
    text-decoration: none;
    border: 4px solid #FFF8E7;      
    box-shadow: 0 8px 20px rgba(0,0,0,0.4);
    transition: all 0.35s ease;
    white-space: nowrap;
  }

  .btn.primary   { background: transparent; color: #FFF8E7; }   /* 赭石棕 */
  .btn.secondary { background: transparent; color: #FFF8E7; }      /* 鞍褐色 */
  .btn.tertiary  { background: transparent; color: #FFF8E7; }

  .btn:hover {
    transform: translateY(-5px);
  }
  .btn.primary:hover   { background: #FFF8E7; color: #5D3A1A; }
  .btn.secondary:hover { background: #FFF8E7; color: #5D3A1A; }
  .btn.tertiary:hover  { background: #FFF8E7; color: #5D3A1A; }

  /* 手机端优雅换行 */
  @media (max-width: 680px) {
    .hero-buttons {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .btn {
      padding: 0.95rem 2rem;
      font-size: 1.18rem;
      min-width: 270px;
    }
  }
</style>