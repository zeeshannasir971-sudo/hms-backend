import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Queue, QueueDocument } from '../../common/schemas/queue.schema';
import { CreateQueueDto } from './dto/create-queue.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class QueueService {
  constructor(
    @InjectModel(Queue.name) private queueModel: Model<QueueDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async addToQueue(createQueueDto: CreateQueueDto): Promise<Queue> {
    // Get the next position in queue for this doctor
    const lastPosition = await this.queueModel
      .findOne({ doctorId: createQueueDto.doctorId })
      .sort({ position: -1 })
      .exec();

    const position = lastPosition ? lastPosition.position + 1 : 1;
    
    // Calculate estimated wait time (15 minutes per patient ahead)
    const estimatedWaitTime = (position - 1) * 15;

    const queueEntry = new this.queueModel({
      ...createQueueDto,
      position,
      estimatedWaitTime,
    });

    const savedQueueEntry = await queueEntry.save();

    // Populate the queue entry to get patient and doctor info
    const populatedEntry = await this.queueModel
      .findById(savedQueueEntry._id)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .exec();

    // Send notification to patient
    if (populatedEntry && populatedEntry.patientId) {
      const patientUserId = (populatedEntry.patientId as any).userId?._id;
      const doctorUserId = (populatedEntry.doctorId as any).userId?._id;
      const doctorName = (populatedEntry.doctorId as any).userId 
        ? `${(populatedEntry.doctorId as any).userId.firstName} ${(populatedEntry.doctorId as any).userId.lastName}`
        : 'Doctor';
      const patientName = (populatedEntry.patientId as any).userId 
        ? `${(populatedEntry.patientId as any).userId.firstName} ${(populatedEntry.patientId as any).userId.lastName}`
        : 'Patient';

      // Notify patient
      if (patientUserId) {
        await this.notificationsService.createNotification({
          userId: patientUserId.toString(),
          title: '🏥 Added to Queue',
          message: `You have been checked in and added to the queue for Dr. ${doctorName}. You are position #${position} with an estimated wait time of ${estimatedWaitTime} minutes.`,
          type: 'queue',
          priority: 'medium',
          relatedEntityId: savedQueueEntry._id,
          relatedEntityType: 'queue'
        });
      }

      // Notify doctor
      if (doctorUserId) {
        await this.notificationsService.createNotification({
          userId: doctorUserId.toString(),
          title: '👤 New Patient in Queue',
          message: `${patientName} has been added to your queue. They are position #${position}. Total patients waiting: ${position}.`,
          type: 'queue',
          priority: 'medium',
          relatedEntityId: savedQueueEntry._id,
          relatedEntityType: 'queue'
        });
      }
    }

    return savedQueueEntry;
  }

  async getQueue(doctorId?: string): Promise<Queue[]> {
    const filter = doctorId ? { doctorId } : {};
    return this.queueModel
      .find(filter)
      .populate('patientId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName specialization')
      .populate('appointmentId')
      .sort({ position: 1 })
      .exec();
  }

  async updateQueueStatus(id: string, status: string): Promise<Queue> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid queue ID');
    }

    const queueEntry = await this.queueModel
      .findById(id)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .exec();

    if (!queueEntry) {
      throw new NotFoundException('Queue entry not found');
    }

    const oldStatus = queueEntry.status;
    queueEntry.status = status;
    
    if (status === 'in-consultation') {
      queueEntry.consultationStartedAt = new Date();
    } else if (status === 'completed') {
      queueEntry.consultationCompletedAt = new Date();
      // Update positions for remaining patients
      await this.updateQueuePositions(queueEntry.doctorId.toString(), queueEntry.position);
    }

    const updatedEntry = await queueEntry.save();

    // Send notification to patient about status change
    const patientUserId = (queueEntry.patientId as any).userId?._id;
    const doctorUserId = (queueEntry.doctorId as any).userId?._id;
    const doctorName = (queueEntry.doctorId as any).userId 
      ? `${(queueEntry.doctorId as any).userId.firstName} ${(queueEntry.doctorId as any).userId.lastName}`
      : 'Doctor';
    const patientName = (queueEntry.patientId as any).userId 
      ? `${(queueEntry.patientId as any).userId.firstName} ${(queueEntry.patientId as any).userId.lastName}`
      : 'Patient';

    if (patientUserId) {
      let notificationTitle = '';
      let notificationMessage = '';

      switch (status) {
        case 'in-consultation':
          notificationTitle = '👨‍⚕️ Consultation Started';
          notificationMessage = `Your consultation with Dr. ${doctorName} has started. Please proceed to the consultation room.`;
          break;
        case 'completed':
          notificationTitle = '✅ Consultation Completed';
          notificationMessage = `Your consultation with Dr. ${doctorName} has been completed. Thank you for visiting us!`;
          break;
        default:
          notificationTitle = '📋 Queue Status Update';
          notificationMessage = `Your queue status has been updated to: ${status}`;
      }

      await this.notificationsService.createNotification({
        userId: patientUserId.toString(),
        title: notificationTitle,
        message: notificationMessage,
        type: 'queue',
        priority: status === 'in-consultation' ? 'high' : 'medium',
        relatedEntityId: updatedEntry._id,
        relatedEntityType: 'queue'
      });
    }

    // Send notification to doctor about status change
    if (doctorUserId && status === 'completed') {
      await this.notificationsService.createNotification({
        userId: doctorUserId.toString(),
        title: '✅ Consultation Completed',
        message: `Consultation with ${patientName} has been marked as completed. Next patient in queue will be notified.`,
        type: 'queue',
        priority: 'medium',
        relatedEntityId: updatedEntry._id,
        relatedEntityType: 'queue'
      });
    }

    return updatedEntry;
  }

  private async updateQueuePositions(doctorId: string, completedPosition: number): Promise<void> {
    // Get all affected queue entries before updating
    const affectedEntries = await this.queueModel
      .find({ 
        doctorId, 
        position: { $gt: completedPosition },
        status: 'waiting'
      })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .exec();

    // Update positions
    await this.queueModel.updateMany(
      { 
        doctorId, 
        position: { $gt: completedPosition },
        status: 'waiting'
      },
      { 
        $inc: { position: -1, estimatedWaitTime: -15 }
      }
    );

    // Send notifications to affected patients
    for (const entry of affectedEntries) {
      const patientUserId = (entry.patientId as any).userId?._id;
      const doctorName = (entry.doctorId as any).userId 
        ? `${(entry.doctorId as any).userId.firstName} ${(entry.doctorId as any).userId.lastName}`
        : 'Doctor';
      
      const newPosition = entry.position - 1;
      const newWaitTime = entry.estimatedWaitTime - 15;

      if (patientUserId) {
        await this.notificationsService.createNotification({
          userId: patientUserId.toString(),
          title: '📈 Queue Position Updated',
          message: `Good news! You've moved up in the queue for Dr. ${doctorName}. You are now position #${newPosition} with an estimated wait time of ${Math.max(0, newWaitTime)} minutes.`,
          type: 'queue',
          priority: 'medium',
          relatedEntityId: entry._id,
          relatedEntityType: 'queue'
        });
      }
    }
  }

  async getPatientQueueStatus(patientId: string): Promise<Queue | null> {
    return this.queueModel
      .findOne({ patientId, status: { $in: ['waiting', 'in-consultation'] } })
      .populate('doctorId', 'firstName lastName specialization')
      .exec();
  }

  async removeFromQueue(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid queue ID');
    }

    const queueEntry = await this.queueModel
      .findById(id)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .exec();

    if (!queueEntry) {
      throw new NotFoundException('Queue entry not found');
    }

    // Send notification to patient before removing
    const patientUserId = (queueEntry.patientId as any).userId?._id;
    const doctorUserId = (queueEntry.doctorId as any).userId?._id;
    const doctorName = (queueEntry.doctorId as any).userId 
      ? `${(queueEntry.doctorId as any).userId.firstName} ${(queueEntry.doctorId as any).userId.lastName}`
      : 'Doctor';
    const patientName = (queueEntry.patientId as any).userId 
      ? `${(queueEntry.patientId as any).userId.firstName} ${(queueEntry.patientId as any).userId.lastName}`
      : 'Patient';

    // Notify patient
    if (patientUserId) {
      await this.notificationsService.createNotification({
        userId: patientUserId.toString(),
        title: '❌ Removed from Queue',
        message: `You have been removed from the queue for Dr. ${doctorName}. Please contact the front desk if you have any questions.`,
        type: 'queue',
        priority: 'high',
        relatedEntityId: queueEntry._id,
        relatedEntityType: 'queue'
      });
    }

    // Notify doctor
    if (doctorUserId) {
      await this.notificationsService.createNotification({
        userId: doctorUserId.toString(),
        title: '👤 Patient Removed from Queue',
        message: `${patientName} has been removed from your queue. Queue positions have been updated automatically.`,
        type: 'queue',
        priority: 'medium',
        relatedEntityId: queueEntry._id,
        relatedEntityType: 'queue'
      });
    }

    await this.queueModel.findByIdAndDelete(id);
    await this.updateQueuePositions(queueEntry.doctorId.toString(), queueEntry.position);
  }
}