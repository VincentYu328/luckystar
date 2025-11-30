// src/routes/size-guide/+page.server.js

import { API_BASE } from '$lib/server/api.js';

export async function load({ fetch }) {
  try {
    console.log('[SIZE GUIDE] Fetching from:', `${API_BASE}/sizecharts/public`);
    const res = await fetch(`${API_BASE}/sizecharts/public`);

    if (!res.ok) {
      console.error("[SIZE GUIDE] Failed to fetch size charts:", res.status);
      return { charts: [] }; // fallback 到前端静态
    }

    const charts = await res.json();
    console.log('[SIZE GUIDE] Fetched charts:', charts);
    console.log('[SIZE GUIDE] Number of charts:', Array.isArray(charts) ? charts.length : 'not array');

    return { charts };

  } catch (err) {
    console.error("[SIZE GUIDE] Error loading size charts:", err);
    return { charts: [] }; // fallback
  }
}
