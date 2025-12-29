import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  patientId: string;

  @IsString()
  doctorId: string;

  @IsString()
  departmentId: string;

  @IsDateString()
  appointmentDate: string;

  @IsString()
  timeSlot: string;

  @IsOptional()
  @IsString()
  appointmentType?: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(['scheduled', 'confirmed', 'completed', 'cancelled'])
  status?: string;
}