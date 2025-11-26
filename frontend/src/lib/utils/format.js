// src/lib/utils/format.js

/**
 * 日期格式化（yyyy-mm-dd）
 */
export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

/**
 * Date + time
 */
export function formatDateTime(date) {
  if (!date) return "";
  const d = new Date(date);

  return (
    formatDate(d) +
    " " +
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  );
}

/**
 * 首字母大写
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 截断字符串
 */
export function truncate(str, max = 40) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max) + "...";
}
