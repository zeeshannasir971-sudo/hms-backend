import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getUserNotifications(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.notificationsService.getUserNotifications(req.user.userId, page, limit);
  }

  @Get('statistics')
  getNotificationStatistics(@Request() req) {
    return this.notificationsService.getNotificationStatistics(req.user.userId);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('mark-all-read')
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Delete(':id')
  deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }

  @Post('send-bulk')
  sendBulkNotification(@Body() data: { userIds: string[], title: string, message: string, type?: string }) {
    return this.notificationsService.sendBulkNotification(data.userIds, data.title, data.message, data.type);
  }

  @Post('test-notification')
  async testNotification(@Body() data: { userId: string, title: string, message: string }, @Request() req) {
    try {
      // Use the authenticated user's ID if no userId provided
      const targetUserId = data.userId || req.user.userId;
      
      const notification = await this.notificationsService.createNotification({
        userId: targetUserId,
        title: data.title || 'Test Notification',
        message: data.message || 'This is a test notification to verify the system is working.',
        type: 'system',
        priority: 'medium'
      });

      return { success: true, message: 'Test notification sent successfully', notification };
    } catch (error) {
      console.error('Test notification error:', error);
      return { success: false, error: error.message };
    }
  }

  @Post('cleanup-expired')
  cleanupExpiredNotifications() {
    return this.notificationsService.cleanupExpiredNotifications();
  }
}