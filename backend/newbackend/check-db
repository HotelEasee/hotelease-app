const { pool } = require('./src/config/database');

async function checkDatabase() {
  try {
    // Check connection
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log('   Server time:', connectionTest.rows[0].now);
    
    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables in database:');
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️  No tables found - database schema needs to be initialized');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    // Check users table structure if it exists
    if (tablesResult.rows.some(r => r.table_name === 'users')) {
      const columnsResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);
      
      console.log('\n👤 Users table columns:');
      columnsResult.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('\n⚠️  Users table does not exist');
    }
    
    // Check hotels table
    if (tablesResult.rows.some(r => r.table_name === 'hotels')) {
      const hotelCount = await pool.query('SELECT COUNT(*) as count FROM hotels');
      console.log(`\n🏨 Hotels in database: ${hotelCount.rows[0].count}`);
    } else {
      console.log('\n⚠️  Hotels table does not exist');
    }
    
    await pool.end();
    console.log('\n✅ Check complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Stack:', error.stack);
    await pool.end();
    process.exit(1);
  }
}

checkDatabase();

