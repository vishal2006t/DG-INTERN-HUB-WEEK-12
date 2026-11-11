/**
 * Shared JWT Configuration Helper
 * Enforces explicit JWT_SECRET in production and provides a controlled fallback only in dev/test.
 */
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim().length > 0) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable must be set in production');
  }
  return 'dg_interns_hub_jwt_fallback_secret';
};

