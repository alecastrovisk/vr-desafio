import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessageStatus } from 'src/shared/enums/message-status.enum';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationConsumer {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern(
    process.env.RABBITMQ_QUEUE || 'fila.notificacao.entrada.Alexandre',
  )
  async handleNotification(
    @Payload() data: { mensagemId: string; conteudoMensagem: string },
  ) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000),
    );

    const random = Math.floor(Math.random() * 10) + 1;
    const status =
      random <= 2
        ? MessageStatus.FALHA_PROCESSAMENTO
        : MessageStatus.PROCESSADO_SUCESSO;

    this.notificationService.updateStatus({
      mensagemId: data.mensagemId,
      status,
    });
  }
}
