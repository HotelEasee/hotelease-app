/**
 * Script to create or update admin user
 * Run with: node scripts/createAdmin.js
 */

const bcrypt = require('bcryptjs');
const { query } = require('../src/config/database');
require('dotenv').config();

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '1234admin';
const ADMIN_FIRST_NAME = 'Admin';
const ADMIN_LAST_NAME = 'User';

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);

    // Check if admin user already exists
    const existingUser = await query('SELECT id, email, role FROM users WHERE email = $1', [ADMIN_EMAIL]);

    if (existingUser.rowCount > 0) {
      const user = existingUser.rows[0];
      console.log(`\n✅ Admin user already exists with ID: ${user.id}`);

      // Update password and role
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      await query(
        `UPDATE users 
         SET password_hash = $1, 
             role = 'admin',
             first_name = $2,
             last_name = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [hashedPassword, ADMIN_FIRST_NAME, ADMIN_LAST_NAME, user.id]
      );

      console.log('✅ Admin user updated successfully!');
      console.log('   - Password has been reset');
      console.log('   - Role set to admin');
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'admin', NOW(), NOW())
         RETURNING id, email, role`,
        [ADMIN_EMAIL, hashedPassword, ADMIN_FIRST_NAME, ADMIN_LAST_NAME]
      );

      console.log('\n✅ Admin user created successfully!');
      console.log(`   User ID: ${result.rows[0].id}`);
      console.log(`   Email: ${result.rows[0].email}`);
      console.log(`   Role: ${result.rows[0].role}`);
    }

    console.log('\n📝 Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n✅ You can now login to the admin dashboard!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    process.exit(1);
  }
}

// Run the script
createAdmin();

