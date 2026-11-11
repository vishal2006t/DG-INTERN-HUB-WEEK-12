import mongoose from 'mongoose';

/**
 * Mask sensitive credentials from MongoDB URI for safe logging
 */
export const maskMongoUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
};

/**
 * Retrieve current MongoDB connection status and metadata
 */
export const getConnectionStatus = () => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };

  const readyState = mongoose.connection.readyState;
  return {
    state: stateMap[readyState] || 'unknown',
    readyState,
    isConnected: readyState === 1,
    host: mongoose.connection.host || null,
    port: mongoose.connection.port || null,
    name: mongoose.connection.name || null
  };
};

/**
 * Establish connection to MongoDB using Mongoose.
 * Supports local MongoDB and MongoDB Atlas via MONGODB_URI environment variable.
 * Fails fast and explicitly if the database is unreachable — no silent in-memory fallback.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dg_interns_hub';
  const maskedUri = maskMongoUri(uri);

  mongoose.set('strictQuery', false);

  try {
    console.log(`[Database] Connecting to MongoDB: ${maskedUri}`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      autoIndex: true // Build indexes defined in schemas
    });

    console.log(`[Database] MongoDB connected successfully:`);
    console.log(`  - Host:     ${conn.connection.host}`);
    console.log(`  - Port:     ${conn.connection.port}`);
    console.log(`  - Database: ${conn.connection.name}`);

    // Register connection lifecycle listeners
    mongoose.connection.on('error', (err) => {
      console.error(`[Database] MongoDB runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB connection lost/disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] MongoDB reconnected successfully.');
    });

    return conn.connection;
  } catch (error) {
    console.error(`=======================================================`);
    console.error(`[Database] FATAL: Failed to connect to MongoDB!`);
    console.error(`[Database] Target URI: ${maskedUri}`);
    console.error(`[Database] Error: ${error.message}`);
    console.error(`-------------------------------------------------------`);
    console.error(`Troubleshooting Steps:`);
    console.error(`1. For Local MongoDB: Ensure MongoDB Community Server is running on port 27017.`);
    console.error(`2. For MongoDB Atlas: Verify your MONGODB_URI in .env and check IP access list (whitelist 0.0.0.0/0 or current IP).`);
    console.error(`=======================================================`);

    // Explicitly reject and propagate error — never silently mock or fallback to in-memory
    throw error;
  }
};

/**
 * Gracefully close the MongoDB connection
 */
export const closeDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('[Database] MongoDB connection closed gracefully.');
    }
  } catch (err) {
    console.error('[Database] Error closing MongoDB connection:', err.message);
  }
};

