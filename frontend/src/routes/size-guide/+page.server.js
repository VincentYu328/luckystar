// src/routes/size-guide/+page.server.js

import { API_BASE } from '$lib/server/api.js';

export async function load({ fetch }) {
  try {
    const res = await fetch(`${API_BASE}/sizecharts/public`);

    if (!res.ok) {
      console.error("Failed to fetch size charts:", res.status);
      return { charts: [] }; // fallback 到前端静态
    }

    const charts = await res.json();

    return { charts };

  } catch (err) {
    console.error("Error loading size charts:", err);

    return { charts: [] }; // fallback
  }
}
