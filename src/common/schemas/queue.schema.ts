import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QueueDocument = Queue & Document;

@Schema({ timestamps: true })
export class Queue {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointmentId: Types.ObjectId;

  @Prop({ required: true })
  position: number;

  @Prop({ 
    required: true, 
    enum: ['waiting', 'in-consultation', 'completed'],
    default: 'waiting'
  })
  status: string;

  @Prop({ required: true })
  estimatedWaitTime: number;

  @Prop({ required: true, default: Date.now })
  checkedInAt: Date;

  @Prop()
  consultationStartedAt: Date;

  @Prop()
  consultationCompletedAt: Date;
}

export const QueueSchema = SchemaFactory.createForClass(Queue);