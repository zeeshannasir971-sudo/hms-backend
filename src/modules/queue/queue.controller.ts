import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QueueService } from './queue.service';
import { CreateQueueDto } from './dto/create-queue.dto';

@Controller('queue')
@UseGuards(AuthGuard('jwt'))
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  addToQueue(@Body() createQueueDto: CreateQueueDto) {
    return this.queueService.addToQueue(createQueueDto);
  }

  @Get()
  getQueue(@Query('doctorId') doctorId?: string) {
    return this.queueService.getQueue(doctorId);
  }

  @Get('patient/:patientId')
  getPatientQueueStatus(@Param('patientId') patientId: string) {
    return this.queueService.getPatientQueueStatus(patientId);
  }

  @Patch(':id/status')
  updateQueueStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.queueService.updateQueueStatus(id, status);
  }

  @Delete(':id')
  async removeFromQueue(@Param('id') id: string) {
    await this.queueService.removeFromQueue(id);
    return { success: true, message: 'Patient removed from queue successfully' };
  }
}