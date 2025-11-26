// src/lib/utils/validation.js

/**
 * 必填字段检查
 */
export function required(value) {
  return value !== undefined && value !== null && value !== "";
}

/**
 * 邮箱格式
 */
export function isEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * NZ 电话简单校验
 */
export function isPhone(phone) {
  if (!phone) return false;
  return /^[0-9+\-\s]{7,20}$/.test(phone);
}

/**
 * 长度限制
 */
export function minLength(str, len) {
  return str && str.length >= len;
}

export function maxLength(str, len) {
  return str && str.length <= len;
}

/**
 * 数字校验
 */
export function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * 整数校验
 */
export function isInteger(n) {
  return Number.isInteger(Number(n));
}
