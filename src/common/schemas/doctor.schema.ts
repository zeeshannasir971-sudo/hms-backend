import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DoctorDocument = Doctor & Document;

@Schema({ timestamps: true })
export class Doctor {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  specialization: string;

  @Prop({ required: true, unique: true })
  licenseNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId: Types.ObjectId;

  @Prop({ required: true })
  experience: number;

  @Prop({ required: true })
  consultationFee: number;

  @Prop({
    type: {
      start: String,
      end: String,
      days: [String]
    },
    required: true
  })
  dutyHours: {
    start: string;
    end: string;
    days: string[];
  };

  @Prop({ default: true })
  isAvailable: boolean;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);