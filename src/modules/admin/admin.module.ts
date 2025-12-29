import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SystemSettings, SystemSettingsSchema } from '../../common/schemas/system-settings.schema';
import { AuditLog, AuditLogSchema } from '../../common/schemas/audit-log.schema';
import { User, UserSchema } from '../../common/schemas/user.schema';
import { Patient, PatientSchema } from '../../common/schemas/patient.schema';
import { Doctor, DoctorSchema } from '../../common/schemas/doctor.schema';
import { Department, DepartmentSchema } from '../../common/schemas/department.schema';
import { Appointment, AppointmentSchema } from '../../common/schemas/appointment.schema';
import { Queue, QueueSchema } from '../../common/schemas/queue.schema';
import { AppointmentType, AppointmentTypeSchema } from '../../common/schemas/appointment-type.schema';
import { Staff, StaffSchema } from '../../common/schemas/staff.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemSettings.name, schema: SystemSettingsSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: User.name, schema: UserSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Queue.name, schema: QueueSchema },
      { name: AppointmentType.name, schema: AppointmentTypeSchema },
      { name: Staff.name, schema: StaffSchema },
    ]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}