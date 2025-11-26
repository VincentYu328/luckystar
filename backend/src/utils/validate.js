// backend/src/utils/validate.js

/* ============================================================
   Lightweight Validation Helpers
   Used across routes / services to avoid duplicated logic
   ============================================================ */

/**
 * Ensure required fields exist and are not empty
 * 
 * @param {object} data - body object
 * @param {array} fields - array of required field names
 * @returns {object|null} - { field, message } or null
 */
export function requireFields(data, fields = []) {
  for (const field of fields) {
    if (!data[field] && data[field] !== 0) {
      return { field, message: `${field} is required.` };
    }
  }
  return null;
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate phone number (NZ style flexible)
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const regex = /^[0-9+\-\s]{7,20}$/;
  return regex.test(phone);
}

/**
 * Validate integer
 */
export function isInteger(value) {
  return Number.isInteger(Number(value));
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value) {
  return typeof value === 'number' && value > 0;
}

/**
 * Validate enum values
 */
export function isInEnum(value, allowed = []) {
  return allowed.includes(value);
}

/**
 * Central Validation Helper:
 * Takes a list of validation checks and returns first error.
 */
export function validate(steps = []) {
  for (const step of steps) {
    if (step.check === false) {
      return {
        field: step.field,
        message: step.message
      };
    }
  }
  return null;
}
