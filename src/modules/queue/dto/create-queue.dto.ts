import { IsString, IsOptional } from 'class-validator';

export class CreateQueueDto {
  @IsString()
  patientId: string;

  @IsString()
  doctorId: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;
}