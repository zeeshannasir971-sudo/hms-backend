import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { QueueGateway } from './queue.gateway';
import { Queue, QueueSchema } from '../../common/schemas/queue.schema';
import { Appointment, AppointmentSchema } from '../../common/schemas/appointment.schema';
import { Patient, PatientSchema } from '../../common/schemas/patient.schema';
import { Doctor, DoctorSchema } from '../../common/schemas/doctor.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Queue.name, schema: QueueSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema },
    ]),
    NotificationsModule,
  ],
  providers: [QueueService, QueueGateway],
  controllers: [QueueController],
  exports: [QueueService],
})
export class QueueModule {}