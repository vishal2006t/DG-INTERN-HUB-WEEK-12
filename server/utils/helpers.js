/**
 * Standard API Response Helper Utilities
 */

export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && meta)
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors !== null && { errors })
  };
  return res.status(statusCode).json(response);
};

/**
 * Escapes special RegExp characters to prevent ReDoS attacks on dynamic search queries.
 */
export const escapeRegExp = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Strips potentially dangerous HTML/script payloads to prevent stored/reflected XSS.
 */
export const sanitizeXSS = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Recursively sanitizes input objects and arrays to prevent NoSQL operator injection ($ and .)
 * and optionally strip XSS vectors on string values.
 */
export const sanitizeQuery = (input, { stripXss = false } = {}) => {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    return stripXss ? sanitizeXSS(input) : input;
  }
  if (typeof input !== 'object') return input;
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeQuery(item, { stripXss }));
  }
  if (input instanceof Date) return input;

  const clean = {};
  for (const key of Object.keys(input)) {
    if (key.startsWith('$') || key.includes('.') || key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    clean[key] = sanitizeQuery(input[key], { stripXss });
  }
  return clean;
};

/**
 * Neutralizes CSV spreadsheet formula injection (=, +, -, @, tab, CR) and quotes cells safely.
 */
export const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
};
