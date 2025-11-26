// src/lib/utils/measurement.js

/**
 * cm ↔ inch 转换
 */
export function cmToInch(cm) {
  return cm / 2.54;
}

export function inchToCm(inch) {
  return inch * 2.54;
}

/**
 * 保留小数（避免 NaN）
 */
export function roundNumber(n, decimals = 1) {
  if (!n && n !== 0) return 0;
  return Number(n.toFixed(decimals));
}

/**
 * 判断量体数值是否合理（例如 10–300 cm）
 */
export function isValidMeasurement(value, min = 10, max = 300) {
  if (value == null || isNaN(value)) return false;
  return value >= min && value <= max;
}
