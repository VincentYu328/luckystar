// src/lib/stores/ui.js
import { writable, derived } from "svelte/store";

// ======================================================
// 1) Global Loading Store
// ======================================================
//
// 支持：
//   ui.loading.start()
//   ui.loading.stop()
//   ui.loading.begin("products")
//   ui.loading.end("products")
//   $ui.loading.isActive
//
// 两种模式：
//   A. Simple mode: 全局布尔
//   B. Multi-key mode: 多任务并行 loading
// ======================================================

function createLoadingStore() {
  // Track global loading boolean + per-key loading map
  const state = writable({
    global: false,
    keys: {}     // { key: true/false }
  });

  // Derived: 是否有任何 loading
  const isActive = derived(state, ($s) => {
    if ($s.global) return true;
    return Object.values($s.keys).some(v => v === true);
  });

  return {
    subscribe: state.subscribe,

    // Global mode
    start() {
      state.update(s => ({ ...s, global: true }));
    },
    stop() {
      state.update(s => ({ ...s, global: false }));
    },

    // Key-based mode
    begin(key) {
      state.update(s => ({
        ...s,
        keys: { ...s.keys, [key]: true }
      }));
    },
    end(key) {
      state.update(s => ({
        ...s,
        keys: { ...s.keys, [key]: false }
      }));
    },

    isActive
  };
}

export const loading = createLoadingStore();


// ======================================================
// 2) Modal Store
// ======================================================
//
// 支持：
//   ui.modal.open("createProduct", { foo: 1 })
//   ui.modal.close()
//   $ui.modal.name
//   $ui.modal.props
// ======================================================

function createModalStore() {
  const state = writable({
    name: null,   // 模态框名称
    props: {}     // 传入参数
  });

  return {
    subscribe: state.subscribe,

    open(name, props = {}) {
      state.set({ name, props });
    },

    close() {
      state.set({ name: null, props: {} });
    }
  };
}

export const modal = createModalStore();


// ======================================================
// 3) Sidebar Store（后台左侧菜单）
// ======================================================
//
// 支持：
//   ui.sidebar.open()
//   ui.sidebar.close()
//   ui.sidebar.toggle()
//   $ui.sidebar.opened
// ======================================================

function createSidebarStore() {
  const opened = writable(false);

  return {
    subscribe: opened.subscribe,

    open() { opened.set(true); },
    close() { opened.set(false); },
    toggle() { opened.update(v => !v); }
  };
}

export const sidebar = createSidebarStore();


// ======================================================
// 4) UI Root Export
// ======================================================

export const ui = {
  loading,
  modal,
  sidebar
};
