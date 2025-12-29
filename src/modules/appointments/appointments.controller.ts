import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Put,
  Param, 
  Delete, 
  UseGuards,
  Request,
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'))
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  findAll(@Request() req, @Query('patientId') patientId?: string, @Query('doctorId') doctorId?: string) {
    if (patientId) {
      return this.appointmentsService.findByPatient(patientId);
    }
    if (doctorId) {
      return this.appointmentsService.findByDoctor(doctorId);
    }
    return this.appointmentsService.findAll();
  }

  @Get('available-slots/:doctorId')
  getAvailableSlots(@Param('doctorId') doctorId: string, @Query('date') date: string) {
    return this.appointmentsService.getAvailableSlots(doctorId, date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Put(':id')
  updatePut(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }
}