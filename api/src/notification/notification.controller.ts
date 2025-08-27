import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('notificar')
  @HttpCode(HttpStatus.ACCEPTED)
  create(@Body() createNotificationDto: CreateNotificationDto) {
    try {
      const messageId = this.notificationService.sendNotification(
        createNotificationDto,
      );

      return {
        messageId,
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao processar notificação',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('notificacao/status/:mensagemId')
  getStatus(@Param('mensagemId') mensagemId: string) {
    try {
      const status = this.notificationService.getStatus(mensagemId);

      if (!status) {
        throw new HttpException(
          'Mensagem não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      return status;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro ao consultar status da notificação',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
