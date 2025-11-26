<script>
  export let clickable = false;      // 是否可点击（带 hover 效果）
  export let shadow = true;          // 是否显示阴影
  export let padding = true;         // 是否内边距
  export let href = null;            // 若提供 href，则整个卡片可点击
</script>

{#if href}
  <a
    class="card-container {clickable ? 'clickable' : ''} {shadow ? 'shadow' : ''} {padding ? 'padding' : ''}"
    href={href}
  >
    <slot />
  </a>
{:else}
  <div
    class="card-container {clickable ? 'clickable' : ''} {shadow ? 'shadow' : ''} {padding ? 'padding' : ''}"
  >
    <slot />
  </div>
{/if}

<style>
  /**************************************************
   * Lucky Star — Global Card Component
   * 与 app.css 中的 .card 风格保持一致
   **************************************************/

  .card-container {
    background: white;
    border-radius: 1rem;
    border: 1px solid rgba(143, 163, 184, 0.15); /* 银蕨灰系 */
    display: block;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .padding {
    padding: 1.25rem;
  }

  .shadow {
    box-shadow: 0 3px 8px rgba(0,0,0,0.06);
  }

  .clickable:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
  }

  a.card-container {
    text-decoration: none;
    color: inherit;
  }
</style>
