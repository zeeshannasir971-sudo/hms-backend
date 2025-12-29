import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Appointment, AppointmentSchema } from '../../common/schemas/appointment.schema';
import { Patient, PatientSchema } from '../../common/schemas/patient.schema';
import { Doctor, DoctorSchema } from '../../common/schemas/doctor.schema';
import { Queue, QueueSchema } from '../../common/schemas/queue.schema';
import { Department, DepartmentSchema } from '../../common/schemas/department.schema';
import { User, UserSchema } from '../../common/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Queue.name, schema: QueueSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}