import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment, AppointmentSchema } from '../../common/schemas/appointment.schema';
import { Doctor, DoctorSchema } from '../../common/schemas/doctor.schema';
import { Patient, PatientSchema } from '../../common/schemas/patient.schema';
import { Department, DepartmentSchema } from '../../common/schemas/department.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
    NotificationsModule,
  ],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}