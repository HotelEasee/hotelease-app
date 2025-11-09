const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Determine connection configuration
// Priority: DATABASE_URL (Render) > Individual env vars > Defaults
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL (provided by Render PostgreSQL)
  console.log('🔌 Using DATABASE_URL for database connection');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render databases
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // Increased timeout for Render databases (may need to wake up)
  };
} else {
  // Use individual environment variables (for local development)
  console.log('⚠️  DATABASE_URL not found, using individual DB_* variables');
  console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   DB_NAME: ${process.env.DB_NAME || 'HotelEase'}`);
  console.log(`   DB_USER: ${process.env.DB_USER || 'postgres'}`);
  
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'HotelEase',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') ? {
      rejectUnauthorized: false
    } : false,
  };
}

// Create connection pool
const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', error);
    throw error;
  }
};

// Export pool and query function
module.exports = {
  pool,
  query
};

