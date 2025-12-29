import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StaffDocument = Staff & Document;

@Schema({ timestamps: true })
export class Staff {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  employeeId: string;

  @Prop({ required: true })
  position: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId: Types.ObjectId;

  @Prop({ required: true })
  joinDate: Date;

  @Prop()
  qualification: string;

  @Prop({
    type: {
      start: String,
      end: String,
      days: [String]
    }
  })
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  salary: number;

  @Prop()
  emergencyContact: string;

  @Prop()
  address: string;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);