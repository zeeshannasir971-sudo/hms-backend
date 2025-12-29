import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { QueueModule } from './modules/queue/queue.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms'),
    AuthModule,
    UsersModule,
    AppointmentsModule,
    QueueModule,
    DoctorsModule,
    DepartmentsModule,
    NotificationsModule,
    MedicalRecordsModule,
    ReportsModule,
    AdminModule,
  ],
})
export class AppModule {}