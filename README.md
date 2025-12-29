## Frontend Architecture

### Page Structure and Routing

The frontend follows Next.js App Router structure with role-based routing:

**Public Pages:**
- `/` - Landing page with system overview
- `/login` - User authentication
- `/register` - New user registration
- `/forgot-password` - Password reset workflow
- `/learn-more` - Detailed system information

**Role-Based Dashboards:**
- `/admin/*` - Administrative interface
- `/doctor/*` - Doctor portal
- `/staff/*` - Staff operations interface
- `/patient/*` - Patient portal

### Component Architecture

**Layout Components:**
- `Layout` - Main application wrapper with navigation
- `Sidebar` - Role-based navigation menu
- `Header` - User information and quick actions

**UI Components:**
- `Card` - Reusable card container
- `Button` - Standardized button component
- `StatCard` - Dashboard statistics display
- `LoadingSpinner` - Loading state indicators
- `Modal` - Dialog and popup components

**Feature Components:**
- `AppointmentForm` - Appointment booking interface
- `QueueDisplay` - Real-time queue status
- `ReportsTable` - Data visualization for reports
- `UserApproval` - Admin user management interface

## User Workflows

### 1. Patient Journey

1. **Registration:** Patient creates account with immediate approval
2. **Profile Setup:** Complete medical information and preferences
3. **Appointment Booking:** Search doctors, select time slots, book appointments
4. **Queue Management:** Check-in for appointments, monitor queue status
5. **Consultation:** Attend appointment, receive medical care
6. **Records Access:** View medical history, prescriptions, reports

### 2. Doctor Workflow

1. **Registration:** Doctor registers with pending status
2. **Admin Approval:** Admin reviews and approves doctor profile
3. **Profile Setup:** Complete professional information and specialization
4. **Schedule Management:** Set availability, manage appointment slots
5. **Patient Care:** Conduct consultations, update medical records
6. **Queue Management:** Process patient queue, update consultation status
7. **Reporting:** View performance metrics and patient statistics

### 3. Staff Operations

1. **Registration:** Staff registers with pending status
2. **Admin Approval:** Admin reviews and approves staff profile
3. **Operational Tasks:** Manage patient queues, assist with appointments
4. **Report Generation:** Create operational reports and analytics
5. **System Support:** Assist patients and doctors with system usage

### 4. Admin Management

1. **System Access:** Login with hard-coded admin credentials
2. **User Management:** Review and approve/reject doctor and staff registrations
3. **System Configuration:** Manage departments, settings, and permissions
4. **Monitoring:** View system-wide reports and performance metrics
5. **Maintenance:** Perform system updates and maintenance tasks
## Security Implementation

### Authentication & Authorization

- **JWT Tokens:** Secure token-based authentication
- **Role-Based Access Control:** Granular permissions per user role
- **Route Protection:** Frontend and backend route guards
- **Session Management:** Automatic token refresh and logout

### Data Security

- **Password Hashing:** bcrypt for secure password storage
- **Input Validation:** Comprehensive data validation on all endpoints
- **SQL Injection Prevention:** MongoDB and Mongoose provide built-in protection
- **File Upload Security:** Restricted file types and size limits

### Admin Security

- **Hard-coded Admin Accounts:** Three pre-configured admin accounts
- **Admin Credentials:**
  - admin1@hospital.com / AdminPass123!
  - admin2@hospital.com / AdminPass456!
  - admin3@hospital.com / AdminPass789!
- **Password Reset Exclusion:** Admin accounts cannot reset passwords
- **Approval Workflow:** Only admins can approve doctor/staff registrations

## API Documentation

### Authentication Endpoints

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/reset-password
POST /api/auth/confirm-reset-password
POST /api/auth/logout
```

### User Management Endpoints

```
GET /api/users/profile
PUT /api/users/profile
POST /api/users/profile/picture
GET /api/users
GET /api/users/patients
```

### Appointment Endpoints

```
GET /api/appointments
POST /api/appointments
PUT /api/appointments/:id
PATCH /api/appointments/:id/cancel
DELETE /api/appointments/:id
GET /api/appointments/available-slots/:doctorId
```

### Queue Management Endpoints

```
GET /api/queue
POST /api/queue
PATCH /api/queue/:id/status
GET /api/queue/patient/:patientId
DELETE /api/queue/:id
```

### Reports Endpoints

```
GET /api/reports/dashboard-summary
GET /api/reports/doctor-dashboard/:doctorId
GET /api/reports/appointment-volume
GET /api/reports/patient-statistics
GET /api/reports/doctor-performance
GET /api/reports/queue-analytics
GET /api/reports/revenue
```

### Admin Endpoints

```
GET /api/admin/users/pending
PUT /api/admin/users/:id/approve
PUT /api/admin/users/:id/reject
GET /api/admin/settings
PUT /api/admin/settings/:key
POST /api/admin/settings
```
## Database Schema Details

### User Schema
```typescript
{
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  phone: string
  role: 'patient' | 'doctor' | 'staff' | 'admin'
  isActive: boolean
  approvalStatus: 'approved' | 'pending' | 'rejected'
  approvedBy: string
  approvedAt: Date
  rejectionReason: string
  profileImage: string
  permissions: object
  timestamps: true
}
```

### Appointment Schema
```typescript
{
  patientId: ObjectId
  doctorId: ObjectId
  departmentId: ObjectId
  appointmentDate: Date
  timeSlot: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  reason: string
  notes: string
  createdBy: ObjectId
  timestamps: true
}
```

### Queue Schema
```typescript
{
  patientId: ObjectId
  doctorId: ObjectId
  appointmentId: ObjectId
  position: number
  estimatedWaitTime: number
  status: 'waiting' | 'in-consultation' | 'completed' | 'cancelled'
  checkedInAt: Date
  consultationStartedAt: Date
  consultationEndedAt: Date
  timestamps: true
}
```

## Deployment Configuration

### Environment Variables

**Backend (.env):**
```
MONGODB_URI=mongodb://localhost:27017/hms
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h
PORT=3001
UPLOAD_PATH=./uploads
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Hospital Management System
```

### Development Setup

1. **Backend Setup:**
   ```bash
   cd hms-backend
   npm install
   npm run start:dev
   ```

2. **Frontend Setup:**
   ```bash
   cd hms-frontend
   npm install
   npm run dev
   ```

3. **Database Setup:**
   - Install and start MongoDB
   - Run seed script: `npm run seed`
## System Features Summary

### Implemented Features ✅

1. **User Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Password reset functionality
   - Hard-coded admin accounts

2. **User Management**
   - Registration with approval workflow
   - Profile management with image upload
   - Role-specific dashboards
   - User status management

3. **Appointment System**
   - Appointment scheduling and management
   - Doctor availability tracking
   - Appointment status workflow
   - Time slot management

4. **Queue Management**
   - Real-time queue tracking
   - Wait time estimation
   - Queue position management
   - Status updates

5. **Medical Records**
   - Patient medical history
   - Consultation notes
   - Treatment tracking
   - Medical report generation

6. **Reports & Analytics**
   - Role-specific dashboards
   - Appointment volume reports
   - Doctor performance analytics
   - Queue analytics

7. **Admin Functions**
   - User approval/rejection
   - System settings management
   - Audit logging
   - System monitoring

### Future Enhancements 🚀

1. **Billing & Payment Integration**
   - Payment processing
   - Insurance management
   - Billing reports
   - Revenue tracking

2. **Advanced Features**
   - Telemedicine support
   - Mobile application
   - Advanced analytics
   - Integration with medical devices

3. **System Improvements**
   - Performance optimization
   - Enhanced security features
   - Automated backups
   - Multi-language support

## Current System Status

### Reports System Analysis

The reports functionality has been implemented and tested across all user roles:

**Admin Reports:**
- ✅ Dashboard summary with system-wide statistics
- ✅ Appointment volume reports with date range filtering
- ✅ Patient statistics and department performance
- ✅ Data export functionality (JSON format)

**Staff Reports:**
- ✅ Operational metrics and queue analytics
- ✅ Department efficiency tracking
- ✅ Wait time analysis
- ✅ CSV/JSON export options

**Doctor Reports:**
- ✅ Personal performance metrics
- ✅ Appointment completion rates
- ✅ Patient statistics and trends
- ✅ Consultation time tracking

**Patient Reports:**
- 🔄 In development - Personal medical history reports
- 🔄 Appointment history and upcoming appointments
- 🔄 Health summary and trends

### Known Issues & Fixes Applied

1. **Data Mapping Issues:** Fixed frontend data access patterns to match API response structure
2. **Report Generation:** Implemented proper error handling for missing data
3. **User Approval System:** Successfully implemented for doctors and staff only
4. **Password Reset:** Properly excludes admin accounts for security
5. **Hard-coded Admins:** Three admin accounts created and secured
