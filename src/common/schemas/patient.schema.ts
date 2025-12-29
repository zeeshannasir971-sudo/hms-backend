import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true, enum: ['male', 'female', 'other'] })
  gender: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  emergencyContact: string;

  @Prop()
  medicalHistory: string;

  @Prop()
  allergies: string;

  @Prop()
  bloodGroup: string;

  @Prop()
  height: number;

  @Prop()
  weight: number;

  @Prop()
  occupation: string;

  @Prop()
  maritalStatus: string;

  @Prop()
  insuranceProvider: string;

  @Prop()
  insuranceNumber: string;

  @Prop([{
    condition: String,
    diagnosedDate: Date,
    status: { type: String, enum: ['active', 'resolved', 'chronic'] }
  }])
  chronicConditions: Array<{
    condition: string;
    diagnosedDate: Date;
    status: string;
  }>;

  @Prop([{
    medication: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String
  }])
  currentMedications: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate: Date;
    prescribedBy: string;
  }>;

  @Prop([{
    surgery: String,
    date: Date,
    hospital: String,
    surgeon: String,
    notes: String
  }])
  surgicalHistory: Array<{
    surgery: string;
    date: Date;
    hospital: string;
    surgeon: string;
    notes: string;
  }>;

  @Prop([{
    vaccine: String,
    date: Date,
    nextDue: Date,
    administeredBy: String
  }])
  vaccinations: Array<{
    vaccine: string;
    date: Date;
    nextDue: Date;
    administeredBy: string;
  }>;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);