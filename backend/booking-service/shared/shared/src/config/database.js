const { Pool } = require('pg');

let pool;

const createDatabasePool = (config = {}) => {
  if (pool) {
    return pool;
  }

  const defaultConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'tne_website',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  };

  pool = new Pool({ ...defaultConfig, ...config });

  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle database client', err);
  });

  pool.on('connect', () => {
    console.log('New database connection established');
  });

  return pool;
};

const query = async (text, params) => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call createDatabasePool() first.');
  }
  return pool.query(text, params);
};

const getClient = async () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call createDatabasePool() first.');
  }
  return pool.connect();
};

const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database pool closed');
  }
};

module.exports = {
  createDatabasePool,
  query,
  getClient,
  closePool,
  get pool() {
    return pool;
  },
};
