// backend/src/utils/validate.js

/* ============================================================
    Lightweight Validation Helpers
    Used across routes / services to avoid duplicated logic
    ============================================================ */

/**
 * Ensure required fields exist and are not empty
 * * @param {object} data - body object
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

// ... (isValidEmail, isValidPhone, isInteger, isPositiveNumber, isInEnum, validate - 保持不变)
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


// =============================================================
// ⭐ NEW: Customer Order Validation
// =============================================================

/**
 * Ensures the order payload from the customer is valid before database insertion.
 * @param {Object} data Order data from the request body.
 * @throws {Error} If validation fails.
 */
export function validateCustomerOrder(data) {
    if (!data.total || typeof data.total !== 'number' || data.total <= 0) {
        throw new Error("Validation Error: Total price must be a positive number.");
    }
    if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new Error("Validation Error: Order must contain items.");
    }

    data.items.forEach((item, index) => {
        // Checks that match frontend payload: product_id, price_snapshot, quantity
        if (!item.product_id || typeof item.product_id !== 'number' || item.product_id <= 0) {
            throw new Error(`Validation Error: Item ${index + 1} missing valid product_id.`);
        }
        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
            throw new Error(`Validation Error: Item ${index + 1} quantity must be positive.`);
        }
        if (!item.price_snapshot || typeof item.price_snapshot !== 'number' || item.price_snapshot < 0) {
            throw new Error(`Validation Error: Item ${index + 1} missing valid price_snapshot.`);
        }
    });
}