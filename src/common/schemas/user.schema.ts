import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  phone: string;

  @Prop({ required: true, enum: ['patient', 'doctor', 'staff', 'admin'] })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ 
    enum: ['approved', 'pending', 'rejected'], 
    default: function() {
      return ['doctor', 'staff'].includes(this.role) ? 'pending' : 'approved';
    }
  })
  approvalStatus: string;

  @Prop()
  approvedBy: string; // Admin user ID who approved/rejected

  @Prop()
  approvedAt: Date;

  @Prop()
  rejectionReason: string;

  @Prop()
  profileImage: string;

  @Prop()
  lastLogin: Date;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpires: Date;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  verificationToken: string;

  @Prop({ default: false })
  isProtected: boolean; // For hardcoded admin accounts that cannot be deleted or modified

  @Prop({
    type: {
      canManageUsers: { type: Boolean, default: false },
      canManageAppointments: { type: Boolean, default: false },
      canManageQueue: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false }
    }
  })
  permissions: {
    canManageUsers: boolean;
    canManageAppointments: boolean;
    canManageQueue: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);