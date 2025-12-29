import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../../common/schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(notificationData: any): Promise<Notification> {
    const notification = new this.notificationModel(notificationData);
    const savedNotification = await notification.save();
    
    // Send real-time notification
    this.notificationsGateway.sendNotificationToUser(
      notificationData.userId.toString(),
      savedNotification
    );
    
    return savedNotification;
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const notifications = await this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.notificationModel.countDocuments({ userId });
    const unreadCount = await this.notificationModel.countDocuments({ userId, isRead: false });

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    };
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.notificationModel
      .findByIdAndUpdate(notificationId, { isRead: true }, { new: true })
      .exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany({ userId, isRead: false }, { isRead: true })
      .exec();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(notificationId).exec();
  }

  // Specific notification types
  async sendAppointmentConfirmation(userId: string, appointmentData: any): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Appointment Confirmed',
      message: `Your appointment with Dr. ${appointmentData.doctorName} on ${appointmentData.date} at ${appointmentData.time} has been confirmed.`,
      type: 'appointment',
      priority: 'medium',
      relatedEntityId: appointmentData.appointmentId,
      relatedEntityType: 'appointment'
    });
  }

  async sendAppointmentReminder(userId: string, appointmentData: any): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Appointment Reminder',
      message: `Reminder: You have an appointment with Dr. ${appointmentData.doctorName} tomorrow at ${appointmentData.time}.`,
      type: 'reminder',
      priority: 'high',
      relatedEntityId: appointmentData.appointmentId,
      relatedEntityType: 'appointment'
    });
  }

  async sendQueueStatusUpdate(userId: string, queueData: any): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Queue Status Update',
      message: `You are now #${queueData.position} in the queue. Estimated wait time: ${queueData.estimatedWaitTime} minutes.`,
      type: 'queue',
      priority: 'medium',
      relatedEntityId: queueData.queueId,
      relatedEntityType: 'queue'
    });
  }

  async sendSystemNotification(userId: string, title: string, message: string, priority: string = 'medium'): Promise<void> {
    await this.createNotification({
      userId,
      title,
      message,
      type: 'system',
      priority
    });
  }

  async sendBulkNotification(userIds: string[], title: string, message: string, type: string = 'system'): Promise<void> {
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type,
      priority: 'medium'
    }));

    await this.notificationModel.insertMany(notifications);
    
    // Send real-time notifications
    userIds.forEach(userId => {
      this.notificationsGateway.sendNotificationToUser(userId, {
        title,
        message,
        type,
        createdAt: new Date()
      });
    });
  }

  async cleanupExpiredNotifications(): Promise<void> {
    await this.notificationModel.deleteMany({
      expiresAt: { $lt: new Date() }
    }).exec();
  }

  async getNotificationStatistics(userId: string): Promise<any> {
    const stats = await this.notificationModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      }
    ]);

    return stats;
  }
}