import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { rabbitMQConfig } from 'src/config/rabbitmq.config';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationConsumer } from './notification.consumer';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: rabbitMQConfig.transport,
        options: rabbitMQConfig.options,
      },
    ]),
  ],
  controllers: [NotificationController, NotificationConsumer],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
