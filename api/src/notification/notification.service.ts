import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MessageStatus } from '../shared/enums/message-status.enum';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationStatusDto } from './dto/notification-status.dto';
import { UpdateNotificationStatusDto } from './dto/update-notification-status.dto';

@Injectable()
export class NotificationService {
  private statusMap = new Map<string, NotificationStatusDto>();

  constructor(@Inject('NOTIFICATION_SERVICE') private client: ClientProxy) {}

  sendNotification(createNotificationDto: CreateNotificationDto): {
    mensagemId: string;
  } {
    const { mensagemId, conteudoMensagem } = createNotificationDto;

    this.statusMap.set(mensagemId, {
      mensagemId,
      status: MessageStatus.AGUARDANDO_PROCESSAMENTO,
      conteudoMensagem,
      timestamp: new Date(),
    });

    try {
      this.client.emit(
        process.env.RABBITMQ_QUEUE || 'fila.notificacao.entrada.Alexandre',
        {
          mensagemId,
          conteudoMensagem,
        },
      );

      return { mensagemId };
    } catch (error) {
      this.statusMap.set(mensagemId, {
        mensagemId,
        status: MessageStatus.FALHA_PROCESSAMENTO,
        conteudoMensagem,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  updateStatus(updateStatusDto: UpdateNotificationStatusDto) {
    const { mensagemId, status } = updateStatusDto;
    const existing = this.statusMap.get(mensagemId);
    if (existing) {
      this.statusMap.set(mensagemId, {
        ...existing,
        status,
        timestamp: new Date(),
      });
    }
  }

  getStatus(messageId: string) {
    return this.statusMap.get(messageId);
  }
}
