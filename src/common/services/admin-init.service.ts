import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import { Patient, PatientDocument } from '../schemas/patient.schema';

@Injectable()
export class AdminInitService {
  private readonly logger = new Logger(AdminInitService.name);

  // Hardcoded admin accounts - these cannot be modified or deleted
  private readonly HARDCODED_ADMINS = [
    {
      firstName: 'Admin',
      lastName: 'One',
      email: 'admin1@hospital.com',
      password: 'AdminPass123!',
      phone: '+1-555-0001',
      role: 'admin',
      dateOfBirth: '1980-01-01',
      gender: 'male',
      address: 'Hospital Administration Building',
      emergencyContact: '+1-555-0002',
      isProtected: true // Mark as protected
    },
    {
      firstName: 'Admin',
      lastName: 'Two',
      email: 'admin2@hospital.com',
      password: 'AdminPass456!',
      phone: '+1-555-0003',
      role: 'admin',
      dateOfBirth: '1975-06-15',
      gender: 'female',
      address: 'Hospital Administration Building',
      emergencyContact: '+1-555-0004',
      isProtected: true // Mark as protected
    },
    {
      firstName: 'Admin',
      lastName: 'Three',
      email: 'admin3@hospital.com',
      password: 'AdminPass789!',
      phone: '+1-555-0005',
      role: 'admin',
      dateOfBirth: '1985-12-20',
      gender: 'other',
      address: 'Hospital Administration Building',
      emergencyContact: '+1-555-0006',
      isProtected: true // Mark as protected
    }
  ];

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async initializeAdmins(): Promise<void> {
    this.logger.log('Initializing hardcoded admin accounts...');

    for (const adminData of this.HARDCODED_ADMINS) {
      try {
        // Check if admin already exists
        const existingUser = await this.userModel.findOne({ email: adminData.email });
        
        if (existingUser) {
          // Update existing admin to ensure it has the latest data and is protected
          const hashedPassword = await bcrypt.hash(adminData.password, 10);
          
          await this.userModel.updateOne(
            { email: adminData.email },
            {
              firstName: adminData.firstName,
              lastName: adminData.lastName,
              password: hashedPassword,
              phone: adminData.phone,
              role: 'admin',
              isActive: true,
              emailVerified: true,
              approvalStatus: 'approved',
              isProtected: true, // Mark as protected
              lastLogin: existingUser.lastLogin || new Date()
            }
          );

          // Ensure patient record exists for admin
          const existingPatient = await this.patientModel.findOne({ userId: existingUser._id });
          if (!existingPatient) {
            const patient = new this.patientModel({
              userId: existingUser._id,
              dateOfBirth: new Date(adminData.dateOfBirth),
              gender: adminData.gender,
              address: adminData.address,
              emergencyContact: adminData.emergencyContact,
            });
            await patient.save();
          }

          this.logger.log(`Updated protected admin account: ${adminData.email}`);
        } else {
          // Create new admin account
          const hashedPassword = await bcrypt.hash(adminData.password, 10);

          const user = new this.userModel({
            email: adminData.email,
            password: hashedPassword,
            role: 'admin',
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            phone: adminData.phone,
            isActive: true,
            emailVerified: true,
            approvalStatus: 'approved',
            isProtected: true, // Mark as protected
          });

          const savedUser = await user.save();

          // Create patient record for admin (required by schema)
          const patient = new this.patientModel({
            userId: savedUser._id,
            dateOfBirth: new Date(adminData.dateOfBirth),
            gender: adminData.gender,
            address: adminData.address,
            emergencyContact: adminData.emergencyContact,
          });
          await patient.save();

          this.logger.log(`Created protected admin account: ${adminData.email}`);
        }
      } catch (error) {
        this.logger.error(`Failed to initialize admin account ${adminData.email}:`, error.message);
      }
    }

    this.logger.log('Admin initialization completed');
  }

  // Method to check if a user is a protected admin
  async isProtectedAdmin(email: string): Promise<boolean> {
    return this.HARDCODED_ADMINS.some(admin => admin.email === email);
  }

  // Method to get all protected admin emails
  getProtectedAdminEmails(): string[] {
    return this.HARDCODED_ADMINS.map(admin => admin.email);
  }

  // Method to prevent deletion of protected admins
  async canDeleteUser(email: string): Promise<boolean> {
    return !(await this.isProtectedAdmin(email));
  }

  // Method to prevent role change of protected admins
  async canChangeUserRole(email: string): Promise<boolean> {
    return !(await this.isProtectedAdmin(email));
  }
}