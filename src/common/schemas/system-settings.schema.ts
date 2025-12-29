import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemSettingsDocument = SystemSettings & Document;

@Schema({ timestamps: true })
export class SystemSettings {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  value: string;

  @Prop()
  description: string;

  @Prop({ 
    enum: ['string', 'number', 'boolean', 'json'],
    default: 'string'
  })
  type: string;

  @Prop({ default: false })
  isSystem: boolean;

  @Prop()
  category: string;
}

export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings);