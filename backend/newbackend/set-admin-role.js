const { pool } = require('./src/config/database');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node set-admin-role.js <email>');
  process.exit(1);
}

pool.query(
  `UPDATE users SET role = 'admin' WHERE email = $1 RETURNING email, role`,
  [email]
)
.then(result => {
  if (result.rowCount === 0) {
    console.log(`❌ User with email ${email} not found`);
  } else {
    console.log(`✅ Admin role set for ${result.rows[0].email}`);
    console.log(`   Role: ${result.rows[0].role}`);
  }
  pool.end();
})
.catch(error => {
  console.error('❌ Error:', error.message);
  pool.end();
  process.exit(1);
});

