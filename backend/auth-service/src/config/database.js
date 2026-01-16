// backend/auth-service/src/config/database.js


const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set - cannot connect to DB');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT || '5000'),
});

pool.on('error', (err) => {
  console.error('Unexpected PG error', err);
});

async function connectDB() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connected');
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err);
    throw err;
  }
}

module.exports = { pool, query: (text, params) => pool.query(text, params), connectDB };



