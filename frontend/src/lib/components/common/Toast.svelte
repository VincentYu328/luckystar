<script>
  import { notifications } from '$lib/stores/notifications.js';
  import { fly, fade } from 'svelte/transition';

  const typeConfig = {
    success: {
      bg: '#0C3C78', // 深海蓝
      text: 'white'
    },
    error: {
      bg: '#B91C1C',
      text: 'white'
    },
    info: {
      bg: '#1A73B7', // 太平洋蓝
      text: 'white'
    },
    warning: {
      bg: '#F6C453',
      text: '#1A1A1A'
    }
  };
</script>

<!-- Toast Container -->
<div class="toast-container">
  {#each $notifications as toast (toast.id)}
    <div
      class="toast"
      in:fly={{ x: 40, duration: 200 }}
      out:fade={{ duration: 200 }}
      style="
        background: {typeConfig[toast.type].bg};
        color: {typeConfig[toast.type].text};
      "
    >
      <div class="toast-message">{toast.message}</div>

      <button
        class="close-btn"
        on:click={() => notifications.remove(toast.id)}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 1.25rem;
    right: 1.25rem;
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    pointer-events: none;
  }

  .toast {
    min-width: 240px;
    max-width: 340px;
    padding: 0.9rem 1.1rem;
    border-radius: 0.85rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 0.95rem;
    font-weight: 500;
    pointer-events: auto;
  }

  .toast-message {
    flex: 1;
    margin-right: 0.75rem;
    line-height: 1.4;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: inherit;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover {
    opacity: 0.8;
  }
</style>
