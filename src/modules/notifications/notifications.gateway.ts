import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    console.log('Client connected to notifications:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected from notifications:', client.id);
    // Remove user from userSockets map
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('joinNotifications')
  handleJoinNotifications(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket
  ) {
    console.log('User joining notifications:', data.userId, 'Socket ID:', client.id); // Debug log
    this.userSockets.set(data.userId, client.id);
    client.join(`user-${data.userId}`);
    return { event: 'joinedNotifications', data: { userId: data.userId } };
  }

  @SubscribeMessage('leaveNotifications')
  handleLeaveNotifications(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket
  ) {
    this.userSockets.delete(data.userId);
    client.leave(`user-${data.userId}`);
    return { event: 'leftNotifications', data: { userId: data.userId } };
  }

  // Method to send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    console.log('Sending notification to user room:', `user-${userId}`, 'Notification:', notification); // Debug log
    this.server.to(`user-${userId}`).emit('newNotification', notification);
  }

  // Method to send notification to all users
  sendBroadcastNotification(notification: any) {
    this.server.emit('broadcastNotification', notification);
  }

  // Method to send notification to users with specific role
  sendRoleBasedNotification(role: string, notification: any) {
    this.server.emit('roleNotification', { role, notification });
  }
}