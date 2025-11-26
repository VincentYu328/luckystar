<script>
  export let data;

  const apiCharts = data?.charts && data.charts.length > 0 ? data.charts : null;

  const fallbackCharts = [
    {
      id: 1,
      name: "Men — Standard Sizes",
      notes: "Measurements in centimetres.",
      items: [
        { size_label: "S", chest: 92, waist: 80, hip: 94, height: 165 },
        { size_label: "M", chest: 98, waist: 86, hip: 100, height: 170 },
        { size_label: "L", chest: 104, waist: 92, hip: 106, height: 175 }
      ]
    },
    {
      id: 2,
      name: "Women — Standard Sizes",
      notes: "Measurements in centimetres.",
      items: [
        { size_label: "S", chest: 84, waist: 68, hip: 92, height: 160 },
        { size_label: "M", chest: 90, waist: 74, hip: 98, height: 165 },
        { size_label: "L", chest: 96, waist: 80, hip: 104, height: 170 }
      ]
    }
  ];

  const charts = apiCharts || fallbackCharts;
</script>

<svelte:head>
  <title>Size Guide — Lucky Star Fashion</title>
  <meta name="description" content="Lucky Star Fashion size guide for fabrics and garments. Accurate measurements for men, women, boys and girls." />
</svelte:head>

<section class="size-guide-hero">
  <div class="page-wrapper">

    <h1 class="page-title">Size Guide</h1>

    {#each charts as chart}
      <div class="chart-card">
        <h2 class="chart-title">{chart.name}</h2>
        {#if chart.notes}<p class="chart-notes">{chart.notes}</p>{/if}

        <div class="table-container">
          <table class="size-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest</th>
                <th>Waist</th>
                <th>Hip</th>
                <th>Height</th>
              </tr>
            </thead>
            <tbody>
              {#each chart.items as row}
                <tr>
                  <td><strong>{row.size_label}</strong></td>
                  <td>{row.chest ?? "-"}</td>
                  <td>{row.waist ?? "-"}</td>
                  <td>{row.hip ?? "-"}</td>
                  <td>{row.height ?? "-"}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/each}

    <!-- 注意事项 -->
    <div class="note-card">
      <h3>Important Notes</h3>
      <ul>
        <li>Measurements are taken in centimetres unless otherwise stated.</li>
        <li>Our in-store sizes may differ from other brands — please measure carefully.</li>
        <li>For group orders, measurements can be recorded in our store.</li>
        <li>Custom tailoring is available for all Pacific community events.</li>
      </ul>
    </div>

  </div>
</section>

<style>
  :global(body) { margin: 0; font-family: system-ui, sans-serif; }

  /* 全屏背景图 */
  .size-guide-hero {
    min-height: 72vh;
    background: url('/images/size-guide.png') center/cover no-repeat fixed;
    padding: 10vh 1.5rem 8vh;
    position: relative;
  }

  /* 轻微深棕蒙版，保证文字清晰 */
  .size-guide-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(241, 238, 235, 0.58);
    backdrop-filter: blur(1px);
  }

  .page-wrapper {
    position: relative;
    max-width: 960px;
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

  /* 每个尺码卡片 */
  .chart-card {
    background: rgba(160, 82, 45, 0.92);
    border: 4px solid #FFF8E7;
    border-radius: 1.4rem;
    padding: 2rem;
    margin-bottom: 2.5rem;
    box-shadow: 0 15px 40px rgba(0,0,0,0.35);
  }

  .chart-title {
    font-size: 1.6rem;
    font-weight: 800;
    color: white;
    margin: 0 0 0.5rem;
    text-align: center;
  }

  .chart-notes {
    color: #FFF8E7;
    text-align: center;
    font-style: italic;
    margin-bottom: 1.2rem;
  }

  /* 表格容器 — 手机端横向滚动 */
  .table-container {
    overflow-x: auto;
    border-radius: 1rem;
    margin: 1rem 0;
  }

  .size-table {
    width: 100%;
    min-width: 540px;
    border-collapse: separate;
    border-spacing: 0;
    background: rgba(255,248,231,0.95);
    border-radius: 1rem;
    overflow: hidden;
  }

  .size-table th {
    background: #8B4513;
    color: white;
    padding: 1rem 0.8rem;
    font-weight: 800;
    font-size: 1.05rem;
  }

  .size-table td {
    padding: 0.9rem 0.8rem;
    text-align: center;
    color: #3E1F0D;
    font-weight: 600;
  }

  .size-table tbody tr:hover {
    background: rgba(255,215,135,0.3);
  }

  /* 注意事项卡片 */
  .note-card {
    background: rgba(160, 82, 45, 0.92);
    border: 4px solid #FFF8E7;
    border-radius: 1.4rem;
    padding: 1rem;
    color: #FFF8E7;
  }

  .note-card h3 {
    font-size: 1.5rem;
    font-weight: 800;
    color: white;
    margin-bottom: 1rem;
    text-align: center;
  }

  .note-card ul {
    margin: 0;
    padding-left: 1.4rem;
    line-height: 1.8;
  }

  .note-card li {
    margin-bottom: 0.6rem;
  }

  /* 手机端优化 */
  @media (max-width: 640px) {
    .chart-card,
    .note-card { padding: 1.6rem; }
    .page-title { margin-bottom: 2rem; }
  }
</style>