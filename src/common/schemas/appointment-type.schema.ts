import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppointmentTypeDocument = AppointmentType & Document;

@Schema({ timestamps: true })
export class AppointmentType {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  duration: number; // in minutes

  @Prop({ required: true })
  color: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  price: number;

  @Prop([String])
  availableDepartments: string[];

  @Prop({ default: false })
  requiresPreparation: boolean;

  @Prop()
  preparationInstructions: string;
}

export const AppointmentTypeSchema = SchemaFactory.createForClass(AppointmentType);