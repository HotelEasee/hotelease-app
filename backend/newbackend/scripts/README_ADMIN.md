# Admin User Setup

## Quick Setup

To create or update the admin user with the following credentials:
- **Email:** admin@gmail.com
- **Password:** 1234admin

Run the following command from the `backend/newbackend` directory:

```bash
node scripts/createAdmin.js
```

## What This Script Does

1. Checks if an admin user with email `admin@gmail.com` already exists
2. If exists: Updates the password and ensures role is set to 'admin'
3. If not exists: Creates a new admin user with the specified credentials

## Requirements

- Database connection must be configured (DATABASE_URL or DB_* variables)
- The `users` table must exist in the database
- Node.js and npm must be installed

## Usage

### Local Development

```bash
cd backend/newbackend
node scripts/createAdmin.js
```

### On Render (via SSH or one-off command)

If you have SSH access to your Render service, you can run:

```bash
cd /opt/render/project/src
node scripts/createAdmin.js
```

Or use Render's one-off command feature in the dashboard.

## Troubleshooting

If you get a database connection error:
1. Make sure DATABASE_URL is set in your environment variables
2. Verify the database is accessible
3. Check that the users table exists

If the script runs but you can't login:
1. Verify the email is exactly: `admin@gmail.com`
2. Verify the password is exactly: `1234admin`
3. Check that the user's role is set to 'admin' in the database

## Manual Database Update

If you prefer to update manually via SQL:

```sql
-- Update existing user to admin
UPDATE users 
SET password_hash = '$2a$10$...', -- Use bcrypt hash of '1234admin'
    role = 'admin',
    updated_at = NOW()
WHERE email = 'admin@gmail.com';

-- Or create new admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, created_at, updated_at)
VALUES (
  'admin@gmail.com',
  '$2a$10$...', -- Use bcrypt hash of '1234admin'
  'Admin',
  'User',
  'admin',
  NOW(),
  NOW()
);
```

Note: You'll need to generate a bcrypt hash for the password. The script does this automatically.

