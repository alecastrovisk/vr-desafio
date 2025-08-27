import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationService } from './notification.service';

@Controller('notificar')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
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
}
