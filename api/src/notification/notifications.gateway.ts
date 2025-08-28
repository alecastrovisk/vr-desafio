import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationStatusDto } from './dto/notification-status.dto';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    namespaces: ['/ws-notifications'],
  },
})
export class NotificationGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { mensagemId: string },
  ) {
    if (!data.mensagemId) {
      client.emit('error', 'Mensagem ID é obrigatório');
      return;
    }
    const room = this.roomName(data.mensagemId);

    client.join(room);
    client.emit('subscribed', { room, mensagemId: data.mensagemId });
  }

  emitStatusUpdate(mensagemId: string, data: NotificationStatusDto) {
    const room = this.roomName(mensagemId);
    this.server.to(room).emit('statusUpdate', data);
  }

  private roomName(id: string) {
    return `msg:${id}`;
  }
}
