// src/lib/utils/currency.js

/**
 * 格式化价格为 NZD
 * formatCurrency(12.5) → "$12.50"
 */
export function formatCurrency(value) {
  if (value == null || isNaN(value)) return "$0.00";

  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    minimumFractionDigits: 2
  }).format(value);
}

/**
 * 将字符串转换为浮点金额
 */
export function parseCurrency(str) {
  if (!str) return 0;
  return Number(str.replace(/[^0-9.-]/g, ""));
}
