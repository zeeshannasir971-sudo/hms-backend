import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class QueueGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinQueue')
  handleJoinQueue(@MessageBody() data: { doctorId: string }, @ConnectedSocket() client: Socket) {
    client.join(`queue-${data.doctorId}`);
    return { event: 'joinedQueue', data: { doctorId: data.doctorId } };
  }

  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(@MessageBody() data: { doctorId: string }, @ConnectedSocket() client: Socket) {
    client.leave(`queue-${data.doctorId}`);
    return { event: 'leftQueue', data: { doctorId: data.doctorId } };
  }

  // Method to emit queue updates to all clients in a doctor's queue room
  emitQueueUpdate(doctorId: string, queueData: any) {
    this.server.to(`queue-${doctorId}`).emit('queueUpdate', queueData);
  }

  // Method to emit patient status updates
  emitPatientStatusUpdate(patientId: string, statusData: any) {
    this.server.emit('patientStatusUpdate', { patientId, ...statusData });
  }
}