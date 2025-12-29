import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ required: true })
  appointmentDate: Date;

  @Prop({ required: true })
  timeSlot: string;

  @Prop({ 
    required: true,
    enum: ['consultation', 'follow-up', 'checkup', 'emergency', 'screening', 'vaccination', 'procedure', 'therapy'],
    default: 'consultation'
  })
  appointmentType: string;

  @Prop({ 
    required: true, 
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
    default: 'scheduled'
  })
  status: string;

  @Prop({ required: true })
  reason: string;

  @Prop()
  notes: string;

  @Prop()
  prescription: string;

  @Prop()
  diagnosis: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);