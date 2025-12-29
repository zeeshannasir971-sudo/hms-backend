import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemSettings, SystemSettingsDocument } from '../../common/schemas/system-settings.schema';
import { AuditLog, AuditLogDocument } from '../../common/schemas/audit-log.schema';
import { User, UserDocument } from '../../common/schemas/user.schema';
import { Patient, PatientDocument } from '../../common/schemas/patient.schema';
import { Doctor, DoctorDocument } from '../../common/schemas/doctor.schema';
import { Department, DepartmentDocument } from '../../common/schemas/department.schema';
import { Appointment, AppointmentDocument } from '../../common/schemas/appointment.schema';
import { Queue, QueueDocument } from '../../common/schemas/queue.schema';
import { AppointmentType, AppointmentTypeDocument } from '../../common/schemas/appointment-type.schema';
import { Staff, StaffDocument } from '../../common/schemas/staff.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(SystemSettings.name) private systemSettingsModel: Model<SystemSettingsDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Queue.name) private queueModel: Model<QueueDocument>,
    @InjectModel(AppointmentType.name) private appointmentTypeModel: Model<AppointmentTypeDocument>,
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
  ) {}

  // System Settings Management
  async getSystemSettings(): Promise<SystemSettings[]> {
    return this.systemSettingsModel.find().exec();
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSettings> {
    const setting = await this.systemSettingsModel.findOneAndUpdate(
      { key },
      { value, updatedAt: new Date() },
      { new: true, upsert: true }
    ).exec();
    
    return setting;
  }

  async createSystemSetting(settingData: any): Promise<SystemSettings> {
    const setting = new this.systemSettingsModel(settingData);
    return setting.save();
  }

  // User Management
  async getAllUsers(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const users = await this.userModel
      .find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.userModel.countDocuments();

    // Transform _id to id for frontend compatibility
    const transformedUsers = users.map(user => ({
      ...user.toObject(),
      id: user._id.toString(),
    }));

    return {
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getPendingUsers(): Promise<any> {
    const users = await this.userModel
      .find({ 
        approvalStatus: 'pending',
        role: { $in: ['doctor', 'staff'] }
      })
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    return users.map(user => ({
      ...user.toObject(),
      id: user._id.toString(),
    }));
  }

  async approveUser(userId: string, adminId: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { 
        approvalStatus: 'approved',
        approvedBy: adminId,
        approvedAt: new Date()
      },
      { new: true }
    ).select('-password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async rejectUser(userId: string, adminId: string, reason: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { 
        approvalStatus: 'rejected',
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: reason
      },
      { new: true }
    ).select('-password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserRole(userId: string, role: string, permissions: any): Promise<User> {
    console.log('Updating user role:', { userId, role, permissions });
    
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role, permissions },
      { new: true }
    ).select('-password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log('User role updated successfully:', user);
    return user;
  }

  async deactivateUser(userId: string): Promise<User> {
    console.log('Deactivating user:', userId);
    
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log('User deactivated successfully:', user);
    return user;
  }

  async activateUser(userId: string): Promise<User> {
    console.log('Activating user:', userId);
    
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    ).select('-password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log('User activated successfully:', user);
    return user;
  }

  async createUser(userData: any): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new ForbiddenException('User with this email already exists');
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = new this.userModel({
      ...userData,
      password: hashedPassword,
      isActive: true,
      emailVerified: false
    });

    const savedUser = await user.save();
    return this.userModel.findById(savedUser._id).select('-password').exec();
  }

  async updateUser(userId: string, updateData: any): Promise<User> {
    // Remove password from update data if present and hash it
    if (updateData.password) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updatePatient(patientId: string, updateData: any): Promise<any> {
    const patient = await this.patientModel.findByIdAndUpdate(
      patientId,
      updateData,
      { new: true }
    ).exec();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async deleteUser(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).exec();

    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  // Appointment Types Management
  async getAppointmentTypes(): Promise<AppointmentType[]> {
    return this.appointmentTypeModel.find({ isActive: true }).exec();
  }

  async createAppointmentType(appointmentTypeData: any): Promise<AppointmentType> {
    const appointmentType = new this.appointmentTypeModel(appointmentTypeData);
    return appointmentType.save();
  }

  async updateAppointmentType(id: string, updateData: any): Promise<AppointmentType> {
    const appointmentType = await this.appointmentTypeModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!appointmentType) {
      throw new NotFoundException('Appointment type not found');
    }

    return appointmentType;
  }

  async deleteAppointmentType(id: string): Promise<void> {
    const result = await this.appointmentTypeModel
      .findByIdAndUpdate(id, { isActive: false })
      .exec();

    if (!result) {
      throw new NotFoundException('Appointment type not found');
    }
  }

  // Staff Management
  async getAllStaff(): Promise<any[]> {
    const staff = await this.staffModel
      .find({ isActive: true })
      .populate('userId', 'firstName lastName email phone')
      .populate('departmentId', 'name')
      .exec();

    // Transform _id to id for frontend compatibility
    return staff.map(staffMember => ({
      ...staffMember.toObject(),
      id: staffMember._id.toString(),
    }));
  }

  async createStaff(staffData: any): Promise<Staff> {
    const staff = new this.staffModel(staffData);
    return staff.save();
  }

  async updateStaff(id: string, updateData: any): Promise<Staff> {
    console.log('Updating staff:', { id, updateData });
    
    const staff = await this.staffModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    console.log('Staff updated successfully:', staff);
    return staff;
  }

  // Audit Logs
  async getAuditLogs(page: number = 1, limit: number = 50): Promise<any> {
    const skip = (page - 1) * limit;
    const logs = await this.auditLogModel
      .find()
      .populate('userId', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.auditLogModel.countDocuments();

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async createAuditLog(logData: any): Promise<AuditLog> {
    const log = new this.auditLogModel(logData);
    return log.save();
  }

  // System Statistics
  async getSystemStatistics(): Promise<any> {
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalDepartments,
      totalStaff,
      todayAppointments,
      currentQueue,
      systemAlerts
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.patientModel.countDocuments(),
      this.doctorModel.countDocuments(),
      this.departmentModel.countDocuments({ isActive: true }),
      this.staffModel.countDocuments({ isActive: true }),
      this.appointmentModel.countDocuments({
        appointmentDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      this.queueModel.countDocuments({ status: { $in: ['waiting', 'in-consultation'] } }),
      this.auditLogModel.countDocuments({
        actionType: 'error',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    return {
      totalUsers,
      totalPatients,
      totalDoctors,
      totalDepartments,
      todayAppointments,
      currentQueue,
      activeStaff: totalStaff,
      systemAlerts
    };
  }

  // Backup and Maintenance
  async performSystemMaintenance(): Promise<any> {
    // Implement system maintenance tasks
    return {
      message: 'System maintenance completed',
      timestamp: new Date(),
      tasks: [
        'Database optimization',
        'Log cleanup',
        'Cache refresh'
      ]
    };
  }

  async exportSystemData(dataType: string): Promise<any> {
    // Implement data export functionality
    switch (dataType) {
      case 'users':
        return this.userModel.find().select('-password').exec();
      case 'audit-logs':
        return this.auditLogModel.find().exec();
      case 'settings':
        return this.systemSettingsModel.find().exec();
      default:
        throw new ForbiddenException('Invalid data type for export');
    }
  }
}