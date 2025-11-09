const { pool } = require('./src/config/database');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 Checking Database Connection...\n');
console.log('Configuration:');
console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`  Database: ${process.env.DB_NAME || 'HotelEase'}`);
console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
console.log(`  Port: ${process.env.DB_PORT || 5432}`);
console.log('\n' + '='.repeat(50) + '\n');

// Test connection
pool.query('SELECT NOW() as current_time, current_database() as db_name, version() as pg_version', (err, res) => {
  if (err) {
    console.error('❌ Connection FAILED!');
    console.error('Error:', err.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if the database is awake (Render free tier databases sleep)');
    console.error('2. Verify your credentials in .env file');
    console.error('3. Check your internet connection');
    process.exit(1);
  } else {
    console.log('✅ Connection SUCCESSFUL!');
    console.log(`📅 Current Time: ${res.rows[0].current_time}`);
    console.log(`💾 Database: ${res.rows[0].db_name}`);
    console.log(`📌 PostgreSQL: ${res.rows[0].pg_version.split(' ')[0]} ${res.rows[0].pg_version.split(' ')[1]}`);
    console.log('\n✅ Your backend is connected to Render PostgreSQL!');
    pool.end();
    process.exit(0);
  }
});

