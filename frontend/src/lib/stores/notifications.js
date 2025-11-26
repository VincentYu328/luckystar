// src/lib/stores/notifications.js
import { writable } from "svelte/store";

// ----------------------------------------------
// Notification structure:
// {
//   id: unique,
//   type: 'success' | 'error' | 'info' | 'warning',
//   message: string,
//   timeout: number (ms)
// }
// ----------------------------------------------

function createNotificationStore() {
  const { subscribe, update } = writable([]);

  // Add new notification
  function push({ type = "info", message, timeout = 3000 }) {
    const id = Date.now() + Math.random();

    update(list => {
      return [...list, { id, type, message, timeout }];
    });

    // Auto-remove after timeout
    setTimeout(() => {
      remove(id);
    }, timeout);

    return id;
  }

  // Remove by ID
  function remove(id) {
    update(list => list.filter(n => n.id !== id));
  }

  return {
    subscribe,
    // Helpers
    success(msg, timeout = 3000) {
      push({ type: "success", message: msg, timeout });
    },
    error(msg, timeout = 4000) {
      push({ type: "error", message: msg, timeout });
    },
    info(msg, timeout = 3000) {
      push({ type: "info", message: msg, timeout });
    },
    warning(msg, timeout = 3500) {
      push({ type: "warning", message: msg, timeout });
    },
    remove
  };
}

export const notifications = createNotificationStore();
