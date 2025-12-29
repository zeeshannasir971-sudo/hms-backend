# Hardcoded Admin Accounts

This HMS Backend system includes three hardcoded admin accounts that are automatically created and maintained by the system. These accounts cannot be deleted, modified, or have their passwords reset through normal user operations.

## Admin Accounts

### Admin Account 1
- **Email**: `admin1@hospital.com`
- **Password**: `AdminPass123!`
- **Name**: Admin One
- **Phone**: +1-555-0001

### Admin Account 2
- **Email**: `admin2@hospital.com`
- **Password**: `AdminPass456!`
- **Name**: Admin Two
- **Phone**: +1-555-0003

### Admin Account 3
- **Email**: `admin3@hospital.com`
- **Password**: `AdminPass789!`
- **Name**: Admin Three
- **Phone**: +1-555-0005

## Security Features

### Protected Status
- These accounts are marked as `isProtected: true` in the database
- They cannot be deleted through any API endpoint
- Their role cannot be changed from 'admin'
- Password reset functionality is disabled for these accounts
- They are automatically recreated if somehow removed from the database

### Automatic Initialization
- These admin accounts are automatically created when the application starts
- If they already exist, their data is updated to ensure consistency
- The system ensures these accounts are always available for system administration

## Usage

### Login
Use any of the above email/password combinations to log into the admin panel.

### First Time Setup
1. Start the HMS Backend application
2. The admin accounts will be automatically created
3. Use any of the admin credentials to log in
4. Access all administrative functions

### Security Recommendations
- Change these passwords in production environments
- The passwords are defined in `src/common/services/admin-init.service.ts`
- Consider implementing additional security measures for production use

## Technical Implementation

### Files Involved
- `src/common/services/admin-init.service.ts` - Main service for admin initialization
- `src/common/schemas/user.schema.ts` - User schema with `isProtected` field
- `src/main.ts` - Application startup with admin initialization
- `src/modules/auth/auth.service.ts` - Authentication service with admin protection

### Database Fields
- `isProtected: true` - Marks accounts as system-protected
- `role: 'admin'` - Administrative role
- `approvalStatus: 'approved'` - Pre-approved status
- `emailVerified: true` - Pre-verified email status

## Troubleshooting

### If Admin Accounts Are Missing
1. Restart the application - they will be automatically recreated
2. Check the console logs for any initialization errors
3. Verify MongoDB connection is working

### If Login Fails
1. Ensure you're using the exact email and password combinations listed above
2. Check that the backend server is running on the correct port
3. Verify the database connection is established

### Password Reset Not Working
This is intentional - protected admin accounts cannot have their passwords reset through the normal password reset flow for security reasons.