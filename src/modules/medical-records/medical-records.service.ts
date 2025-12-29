import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from '../../common/schemas/medical-record.schema';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectModel(MedicalRecord.name) private medicalRecordModel: Model<MedicalRecordDocument>,
  ) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const medicalRecord = new this.medicalRecordModel(createMedicalRecordDto);
    return medicalRecord.save();
  }

  async findByPatient(patientId: string): Promise<MedicalRecord[]> {
    return this.medicalRecordModel
      .find({ patientId })
      .populate('doctorId', 'firstName lastName specialization')
      .populate('appointmentId')
      .sort({ visitDate: -1 })
      .exec();
  }

  async findByDoctor(doctorId: string): Promise<MedicalRecord[]> {
    return this.medicalRecordModel
      .find({ doctorId })
      .populate('patientId')
      .populate('appointmentId')
      .sort({ visitDate: -1 })
      .exec();
  }

  async findOne(id: string): Promise<MedicalRecord> {
    const record = await this.medicalRecordModel
      .findById(id)
      .populate('patientId')
      .populate('doctorId', 'firstName lastName specialization')
      .populate('appointmentId')
      .exec();
    
    if (!record) {
      throw new NotFoundException('Medical record not found');
    }
    
    return record;
  }

  async update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    const record = await this.medicalRecordModel
      .findByIdAndUpdate(id, updateMedicalRecordDto, { new: true })
      .exec();
    
    if (!record) {
      throw new NotFoundException('Medical record not found');
    }
    
    return record;
  }

  async getPatientSummary(patientId: string): Promise<any> {
    const records = await this.findByPatient(patientId);
    
    const summary = {
      totalVisits: records.length,
      lastVisit: records[0]?.visitDate,
      commonDiagnoses: this.getCommonDiagnoses(records),
      currentMedications: this.getCurrentMedications(records),
      chronicConditions: this.getChronicConditions(records),
      recentVitals: records[0]?.vitalSigns,
    };
    
    return summary;
  }

  private getCommonDiagnoses(records: MedicalRecord[]): string[] {
    const diagnoses = records.flatMap(record => record.diagnosis || []);
    const diagnosisCount = diagnoses.reduce((acc, diagnosis) => {
      acc[diagnosis] = (acc[diagnosis] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(diagnosisCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([diagnosis]) => diagnosis);
  }

  private getCurrentMedications(records: MedicalRecord[]): any[] {
    const latestRecord = records[0];
    return latestRecord?.prescriptions || [];
  }

  private getChronicConditions(records: MedicalRecord[]): string[] {
    const conditions = records.flatMap(record => record.diagnosis || []);
    // Logic to identify chronic conditions based on frequency and medical knowledge
    return [...new Set(conditions)].slice(0, 3);
  }

  async generateReport(patientId: string, startDate: Date, endDate: Date): Promise<any> {
    const records = await this.medicalRecordModel
      .find({
        patientId,
        visitDate: { $gte: startDate, $lte: endDate }
      })
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ visitDate: -1 })
      .exec();

    return {
      patientId,
      reportPeriod: { startDate, endDate },
      totalVisits: records.length,
      records: records.map(record => ({
        visitDate: record.visitDate,
        doctor: record.doctorId,
        chiefComplaint: record.chiefComplaint,
        diagnosis: record.diagnosis,
        prescriptions: record.prescriptions,
        vitalSigns: record.vitalSigns,
        attachments: record.attachments
      }))
    };
  }
}