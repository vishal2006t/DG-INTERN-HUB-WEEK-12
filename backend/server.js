/**
 * DG INTERNS HUB - BACKEND SERVER ENTRYPOINT (WEEK 11)
 * 
 * Modular entry point for backend deployment conventions.
 * Proxies to the primary Express.js server engine in server/server.js.
 */

import app, { startServer } from '../server/server.js';

export { app, startServer };
export default app;

