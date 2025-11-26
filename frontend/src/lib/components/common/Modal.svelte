<script>
  export let open = false;
  export let size = "md"; 
  // 允许: sm | md | lg
  export let closeOnOverlay = true;
  export let closeOnEsc = true;

  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl"
  };

  // 触发关闭事件
  const emitClose = () => {
    const ev = new CustomEvent("close");
    dispatchEvent(ev); // 父组件用 on:close 接收
  };

  // ESC 关闭
  const handleKey = (e) => {
    if (open && closeOnEsc && e.key === "Escape") emitClose();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKey);
  }
</script>

{#if open}
  <!-- ===== 背景遮罩 ===== -->
  <div
    class="overlay"
    on:click={() => { if (closeOnOverlay) emitClose(); }}
  />

  <!-- ===== Modal 容器 ===== -->
  <div class="modal-container">
    <div class={`modal-panel ${sizeMap[size] ?? sizeMap.md}`}>

      <!-- slot 内容 -->
      <slot />

    </div>
  </div>
{/if}

<style>
  /**************************************************
   * Lucky Star — Modal
   * 深海蓝 (#0C3C78) / 太平洋蓝 (#1A73B7)
   **************************************************/

  /* 遮罩 */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(12, 60, 120, 0.45);
    backdrop-filter: blur(4px);
    animation: fadeIn 0.25s ease;
    z-index: 90;
  }

  /* 外层容器：居中 */
  .modal-container {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 100;
    animation: fadeIn 0.25s ease;
  }

  /* 内容面板 */
  .modal-panel {
    background: white;
    border-radius: 1.2rem;
    padding: 1.5rem 1.75rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    border: 1px solid rgba(140, 163, 184, 0.15); /* 银蕨灰边框 */
    animation: slideUp 0.25s ease;
  }

  /* 动画 */
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
