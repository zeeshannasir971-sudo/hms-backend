import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  head: string;

  @Prop()
  location: string;

  @Prop()
  contactNumber: string;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);