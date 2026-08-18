/**
 * @file Database Configuration
 * @description PostgreSQL database connection pool configuration
 */

import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

/**
 * PostgreSQL connection pool instance
 * Reused across the application for efficient connection management
 */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Execute a SQL query with parameters
 * @param {string} text - SQL query string
 * @param {any[]} params - Query parameters
 * @returns {Promise<pkg.QueryResult>} Query results
 */
export const query = async (text: string, params: any[] = []): Promise<pkg.QueryResult> => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

/**
 * Execute a callback within a database transaction
 * @param {(client: pkg.PoolClient) => Promise<any>} callback - Transaction callback
 * @returns {Promise<any>} Transaction result
 */
export const transaction = async <T>(
  callback: (client: pkg.PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Close the database pool gracefully
 */
export const closePool = async (): Promise<void> => {
  await pool.end();
};

export default pool;