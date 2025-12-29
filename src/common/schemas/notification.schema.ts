import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ 
    required: true, 
    enum: ['appointment', 'queue', 'system', 'reminder', 'alert'] 
  })
  type: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  })
  priority: string;

  @Prop()
  actionUrl: string;

  @Prop()
  expiresAt: Date;

  @Prop({ type: Types.ObjectId })
  relatedEntityId: Types.ObjectId;

  @Prop()
  relatedEntityType: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);