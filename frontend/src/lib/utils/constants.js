// src/lib/utils/constants.js

// ----------------------------------------------------------
// 全局常量（枚举、状态等）
// ----------------------------------------------------------

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
};

export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  VERIFIED: "verified",
  FAILED: "failed"
};

export const CUSTOMER_TYPES = {
  INDIVIDUAL: "individual",
  GROUP: "group"
};

export const GENDER = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other"
};

export const SIZE_UNITS = ["cm", "inch"];

export const DEFAULT_IMAGE = "/images/placeholder.png";

export const CURRENCY = "NZD";
