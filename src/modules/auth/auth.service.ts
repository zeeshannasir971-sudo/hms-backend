import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../common/schemas/user.schema';
import { Patient, PatientDocument } from '../../common/schemas/patient.schema';
import { Doctor, DoctorDocument } from '../../common/schemas/doctor.schema';
import { Staff, StaffDocument } from '../../common/schemas/staff.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, role, ...userData } = registerDto;

    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new this.userModel({
        email,
        password: hashedPassword,
        role: role || 'patient',
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        isActive: true,
        emailVerified: false,
        approvalStatus: ['doctor', 'staff'].includes(role || 'patient') ? 'pending' : 'approved'
      });

      const savedUser = await user.save();

      // Create role-specific profile
      let roleSpecificId = null;

      // Always create a patient record for basic personal info (required by schema)
      const patient = new this.patientModel({
        userId: savedUser._id,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date(),
        gender: userData.gender || 'other',
        address: userData.address || '',
        emergencyContact: userData.emergencyContact || userData.phone || '',
      });
      const savedPatient = await patient.save();

      if (savedUser.role === 'patient') {
        roleSpecificId = savedPatient._id;
      } else if (savedUser.role === 'doctor') {
        // Create a doctor record
        const doctor = new this.doctorModel({
          userId: savedUser._id,
          specialization: userData.specialization || 'General Medicine',
          licenseNumber: userData.licenseNumber || `LIC${Date.now()}`,
          departmentId: userData.departmentId || null, // Use provided departmentId
          experience: parseInt(userData.experience) || 0,
          consultationFee: parseFloat(userData.consultationFee) || 0,
          dutyHours: {
            start: '09:00',
            end: '17:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          },
          isAvailable: true
        });
        const savedDoctor = await doctor.save();
        roleSpecificId = savedDoctor._id;
      } else if (savedUser.role === 'staff') {
        const staff = new this.staffModel({
          userId: savedUser._id,
          employeeId: userData.employeeId || `EMP${Date.now()}`,
          position: userData.position || 'General Staff',
          joinDate: new Date(),
          qualification: userData.qualification || '',
          isActive: true,
          workingHours: {
            start: '08:00',
            end: '18:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          }
        });
        const savedStaff = await staff.save();
        roleSpecificId = savedStaff._id;
      } else if (savedUser.role === 'admin') {
        // For admin, use patient ID as roleSpecificId
        roleSpecificId = savedPatient._id;
      }

      // Generate JWT token only for approved users
      let token = null;
      if (savedUser.approvalStatus === 'approved') {
        const payload = { 
          sub: savedUser._id, 
          email: savedUser.email, 
          role: savedUser.role,
          roleSpecificId 
        };
        token = this.jwtService.sign(payload);
      }

      const response = {
        user: {
          id: savedUser._id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role,
          roleSpecificId,
          approvalStatus: savedUser.approvalStatus
        },
      };

      if (token) {
        response['token'] = token;
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      // Find user
      const user = await this.userModel.findOne({ email, isActive: true });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check approval status for doctors and staff
      if (['doctor', 'staff'].includes(user.role) && user.approvalStatus !== 'approved') {
        if (user.approvalStatus === 'pending') {
          throw new UnauthorizedException('Your account is pending admin approval. Please wait for approval before logging in.');
        } else if (user.approvalStatus === 'rejected') {
          throw new UnauthorizedException('Your account has been rejected. Please contact administration for more information.');
        }
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Get role-specific ID
      let roleSpecificId = null;
      if (user.role === 'patient') {
        const patient = await this.patientModel.findOne({ userId: user._id });
        roleSpecificId = patient?._id;
      } else if (user.role === 'doctor') {
        const doctor = await this.doctorModel.findOne({ userId: user._id });
        roleSpecificId = doctor?._id;
      } else if (user.role === 'staff') {
        const staff = await this.staffModel.findOne({ userId: user._id });
        roleSpecificId = staff?._id;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const payload = { 
        sub: user._id, 
        email: user.email, 
        role: user.role,
        roleSpecificId 
      };
      const token = this.jwtService.sign(payload);

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          roleSpecificId
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email, isActive: true });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async resetPassword(email: string) {
    try {
      // Find user (exclude admin users)
      const user = await this.userModel.findOne({ 
        email, 
        isActive: true,
        role: { $ne: 'admin' } // Exclude admin users
      });
      
      if (!user) {
        // Don't reveal if user exists or not for security
        return { message: 'If an account with this email exists, a reset code has been sent.' };
      }

      // Generate a simple 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save reset code to user
      user.resetPasswordToken = resetCode;
      user.resetPasswordExpires = resetExpires;
      await user.save();

      // In a real application, you would send this via email
      // For demo purposes, we'll log it to console
      console.log(`Password reset code for ${email}: ${resetCode}`);
      console.log(`Reset code expires at: ${resetExpires}`);

      return { 
        message: 'If an account with this email exists, a reset code has been sent.',
        // For demo purposes only - remove in production
        resetCode: resetCode 
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { message: 'If an account with this email exists, a reset code has been sent.' };
    }
  }

  async confirmResetPassword(email: string, resetCode: string, newPassword: string) {
    try {
      // Find user with valid reset token (exclude admin users)
      const user = await this.userModel.findOne({
        email,
        resetPasswordToken: resetCode,
        resetPasswordExpires: { $gt: new Date() },
        role: { $ne: 'admin' } // Exclude admin users
      });

      if (!user) {
        throw new UnauthorizedException('Invalid or expired reset code');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset fields
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      console.error('Confirm reset password error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to reset password');
    }
  }
}