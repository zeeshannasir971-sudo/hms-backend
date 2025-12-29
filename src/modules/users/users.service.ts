import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../common/schemas/user.schema';
import { Patient, PatientDocument } from '../../common/schemas/patient.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find({ isActive: true }).select('-password').exec();
  }

  async getPatientCount(): Promise<number> {
    return this.patientModel.countDocuments().exec();
  }

  async findAllPatients(): Promise<any[]> {
    try {
      const patients = await this.patientModel
        .find()
        .populate('userId', '-password')
        .exec();
      
      const result = patients.map(patient => {
        if (!patient.userId) {
          return null;
        }
        
        return {
          id: patient._id,
          userId: patient.userId._id,
          user: patient.userId,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          address: patient.address,
          emergencyContact: patient.emergencyContact,
          medicalHistory: patient.medicalHistory,
          allergies: patient.allergies,
          bloodGroup: patient.bloodGroup,
          height: patient.height,
          weight: patient.weight,
          occupation: patient.occupation,
          maritalStatus: patient.maritalStatus,
          insuranceProvider: patient.insuranceProvider,
          insuranceNumber: patient.insuranceNumber,
          chronicConditions: patient.chronicConditions,
          currentMedications: patient.currentMedications,
          surgicalHistory: patient.surgicalHistory,
          vaccinations: patient.vaccinations
        };
      }).filter(patient => patient !== null);
      
      return result;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).select('-password').exec();
    
    if (user.role === 'patient') {
      const patient = await this.patientModel.findOne({ userId }).exec();
      return { ...user.toObject(), patientInfo: patient };
    }
    
    return user;
  }

  async updateProfile(userId: string, updateData: any): Promise<any> {
    const { patientData, ...userData } = updateData;
    
    // Update user data
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, userData, { new: true })
      .select('-password')
      .exec();
    
    // If there's patient data and user is a patient, update patient record
    if (patientData && updatedUser.role === 'patient') {
      const updatedPatient = await this.patientModel
        .findOneAndUpdate(
          { userId }, 
          patientData, 
          { new: true, upsert: true }
        )
        .exec();
      
      return { ...updatedUser.toObject(), patientInfo: updatedPatient };
    }
    
    return updatedUser;
  }

  async updateProfilePicture(userId: string, profilePictureUrl: string): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(
        userId, 
        { profileImage: profilePictureUrl }, 
        { new: true }
      )
      .select('-password')
      .exec();
  }
}