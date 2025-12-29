import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MedicalRecordDocument = MedicalRecord & Document;

@Schema({ timestamps: true })
export class MedicalRecord {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor' })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointmentId: Types.ObjectId;

  @Prop({ required: true })
  visitDate: Date;

  @Prop({ required: true })
  chiefComplaint: string;

  @Prop()
  historyOfPresentIllness: string;

  @Prop({
    type: {
      bloodPressure: String,
      heartRate: String,
      temperature: String,
      respiratoryRate: String,
      oxygenSaturation: String,
      weight: String,
      height: String
    }
  })
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    respiratoryRate: string;
    oxygenSaturation: string;
    weight: string;
    height: string;
  };

  @Prop()
  physicalExamination: string;

  @Prop([String])
  diagnosis: string[];

  @Prop()
  treatmentPlan: string;

  @Prop([{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }])
  prescriptions: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;

  @Prop([{
    test: String,
    reason: String,
    urgency: { type: String, enum: ['routine', 'urgent', 'stat'] }
  }])
  labOrders: Array<{
    test: string;
    reason: string;
    urgency: string;
  }>;

  @Prop([{
    filename: String,
    mimetype: String,
    size: Number,
    uploadDate: Date
  }])
  attachments: Array<{
    filename: string;
    mimetype: string;
    size: number;
    uploadDate: Date;
  }>;

  @Prop()
  followUpInstructions: string;

  @Prop()
  nextAppointmentDate: Date;

  @Prop()
  notes: string;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);